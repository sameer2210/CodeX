import http from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketServer } from 'socket.io';
import app from './src/app.js';
import config from './src/config/config.js';
import connectToDb from './src/db/db.js';
import callService from './src/services/call.service.js';
import messageService from './src/services/message.service.js';

connectToDb();

/* -------------------- SERVER SETUP -------------------- */

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    // origin: ['http://localhost:5173', 'https://codex-psi-murex.vercel.app/'],
    origin: config.FRONTEND_URLS,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingInterval: 25000,
  pingTimeout: 60000,
});
/* -------------------- SOCKET ROOM MANAGER -------------------- */

class SocketRoomManager {
  constructor() {
    // Map: socketId -> { username, teamName, currentProjectId }
    this.connections = new Map();
    // Map: teamName-username -> socketId
    this.userSockets = new Map();
    // Map: projectRoomId -> Set of socketIds
    this.projectRooms = new Map();
  }

  addConnection(socketId, userData) {
    this.connections.set(socketId, userData);
    this.userSockets.set(`${userData.teamName}-${userData.username}`, socketId);
  }

  removeConnection(socketId) {
    const userData = this.connections.get(socketId);
    if (userData) {
      this.userSockets.delete(`${userData.teamName}-${userData.username}`);
      this.connections.delete(socketId);
    }
  }

  updateCurrentProject(socketId, projectId) {
    const userData = this.connections.get(socketId);
    if (userData) {
      userData.currentProjectId = projectId;
    }
  }

  getProjectRoomId(teamName, projectId) {
    return `project:${teamName}:${projectId}`;
  }

  getTeamRoomId(teamName) {
    return `team:${teamName}`;
  }

  getUserSocketId(teamName, username) {
    return this.userSockets.get(`${teamName}-${username}`);
  }

  getConnection(socketId) {
    return this.connections.get(socketId);
  }

  getProjectUsers(teamName, projectId) {
    const roomId = this.getProjectRoomId(teamName, projectId);
    const users = [];

    for (const [socketId, userData] of this.connections.entries()) {
      if (userData.teamName === teamName && userData.currentProjectId === projectId) {
        users.push({
          username: userData.username,
          socketId,
        });
      }
    }

    return users;
  }
}

const roomManager = new SocketRoomManager();

/* -------------------- SOCKET AUTH MIDDLEWARE -------------------- */

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.user = {
      username: decoded.username,
      teamName: decoded.teamName,
      userId: decoded.userId,
    };

    console.log(`User authenticated: ${decoded.username} (Team: ${decoded.teamName})`);
    next();
  } catch (err) {
    console.error('Socket auth failed:', err.message);
    next(new Error('Invalid token'));
  }
});

/* -------------------- SOCKET EVENT HANDLERS -------------------- */

io.on('connection', socket => {
  const { username, teamName } = socket.user;

  console.log(`🔌 Client connected: ${username} from ${teamName}`);

  // Add connection to manager
  roomManager.addConnection(socket.id, {
    username,
    teamName,
    currentProjectId: null,
  });

  // Join team room (for team-wide notifications)
  const teamRoom = roomManager.getTeamRoomId(teamName);
  socket.join(teamRoom);

  // Notify team about user joining
  socket.to(teamRoom).emit('user-online', {
    username,
    timestamp: Date.now(),
  });

  /* ========== PROJECT ROOM MANAGEMENT ========== */

  socket.on('join-project', async ({ projectId }) => {
    if (!projectId) {
      socket.emit('error', { message: 'Project ID required' });
      return;
    }

    try {
      const projectRoom = roomManager.getProjectRoomId(teamName, projectId);

      // Leave previous project room if any
      const currentConnection = roomManager.getConnection(socket.id);
      if (currentConnection?.currentProjectId) {
        const oldRoom = roomManager.getProjectRoomId(teamName, currentConnection.currentProjectId);
        socket.leave(oldRoom);

        // Notify old room about user leaving
        socket.to(oldRoom).emit('user-left-project', {
          username,
          projectId: currentConnection.currentProjectId,
        });
      }

      // Join new project room
      socket.join(projectRoom);
      roomManager.updateCurrentProject(socket.id, projectId);

      console.log(`${username} joined project: ${projectId}`);

      // Send chat history
      const messages = await messageService.getProjectMessages(teamName, projectId, {
        limit: 100,
      });

      socket.emit('chat-history', {
        projectId,
        messages: messages.reverse(),
      });

      // Notify others in the project room
      socket.to(projectRoom).emit('user-joined-project', {
        username,
        projectId,
        timestamp: Date.now(),
      });

      // Send active users list
      const activeUsers = roomManager.getProjectUsers(teamName, projectId);
      io.to(projectRoom).emit('active-users', {
        projectId,
        users: activeUsers.map(u => u.username),
      });

      // Acknowledge join
      socket.emit('project-joined', {
        projectId,
        success: true,
      });
    } catch (error) {
      console.error('Join project error:', error);
      socket.emit('error', {
        message: 'Failed to join project',
        error: error.message,
      });
    }
  });

  socket.on('leave-project', ({ projectId }) => {
    if (!projectId) return;

    const projectRoom = roomManager.getProjectRoomId(teamName, projectId);
    socket.leave(projectRoom);
    roomManager.updateCurrentProject(socket.id, null);

    // Notify project room
    socket.to(projectRoom).emit('user-left-project', {
      username,
      projectId,
    });

    // Update active users
    const activeUsers = roomManager.getProjectUsers(teamName, projectId);
    io.to(projectRoom).emit('active-users', {
      projectId,
      users: activeUsers.map(u => u.username),
    });

    console.log(`${username} left project: ${projectId}`);
  });

  /* ========== CHAT MESSAGING ========== */

  socket.on('chat-message', async ({ projectId, text }) => {
    if (!projectId || !text?.trim()) {
      socket.emit('error', { message: 'Invalid message data' });
      return;
    }

    try {
      // Save message to database
      const message = await messageService.createMessage({
        projectId,
        teamName,
        username,
        message: text.trim(),
        type: 'user',
      });

      const projectRoom = roomManager.getProjectRoomId(teamName, projectId);

      // Broadcast to all users in the project room (including sender)
      io.to(projectRoom).emit('chat-message', {
        projectId,
        message: {
          _id: message._id,
          username: message.username,
          message: message.message,
          type: message.type,
          createdAt: message.createdAt,
        },
      });

      console.log(`Message in project ${projectId}: ${username}: ${text.substring(0, 50)}`);
    } catch (error) {
      console.error('Chat message error:', error);
      socket.emit('error', {
        message: 'Failed to send message',
        error: error.message,
      });
    }
  });

  socket.on('typing-start', ({ projectId }) => {
    if (!projectId) return;

    const projectRoom = roomManager.getProjectRoomId(teamName, projectId);
    socket.to(projectRoom).emit('user-typing', {
      projectId,
      username,
      isTyping: true,
    });
  });

  socket.on('typing-stop', ({ projectId }) => {
    if (!projectId) return;

    const projectRoom = roomManager.getProjectRoomId(teamName, projectId);
    socket.to(projectRoom).emit('user-typing', {
      projectId,
      username,
      isTyping: false,
    });
  });

  /* ========== CODE COLLABORATION ========== */

  socket.on('code-change', ({ projectId, delta, code, cursorPos }) => {
    if (!projectId) return;

    const projectRoom = roomManager.getProjectRoomId(teamName, projectId);

    socket.to(projectRoom).emit('code-change', {
      projectId,
      delta,
      code,
      cursorPos,
      username,
    });
  });

  /* ========== VIDEO CALL SIGNALING ========== */

  const emitToUser = (targetUsername, event, payload) => {
    const targetSocketId = roomManager.getUserSocketId(teamName, targetUsername);
    if (!targetSocketId) return false;
    io.to(targetSocketId).emit(event, payload);
    return true;
  };

  const scheduleCallCleanup = callId => {
    setTimeout(() => callService.cleanup(callId), 2000);
  };

  const handleCallTimeout = callId => {
    const call = callService.getCall(callId);
    if (!call || !['CALLING', 'RINGING'].includes(call.status)) return;

    console.log(`📞 Call timeout: ${callId} (${call.caller} -> ${call.receiver})`);
    callService.setStatus(callId, 'CANCELLED', { reason: 'timeout' });
    emitToUser(call.caller, 'call:cancel', {
      callId,
      from: call.receiver,
      reason: 'timeout',
    });
    emitToUser(call.receiver, 'call:cancel', {
      callId,
      from: call.caller,
      reason: 'timeout',
    });
    emitToUser(call.caller, 'end-call', { from: call.receiver });
    emitToUser(call.receiver, 'end-call', { from: call.caller });
    scheduleCallCleanup(callId);
  };

  const findLegacyCall = targetUsername => {
    return callService.findActiveCallBetween(teamName, username, targetUsername);
  };

  const handleCallInitiate = ({ to, offer, type = 'video', callId }) => {
    const targetSocketId = roomManager.getUserSocketId(teamName, to);

    if (!targetSocketId) {
      socket.emit('call:failed', { reason: 'offline', message: 'User not available' });
      socket.emit('call-failed', { message: 'User not available' });
      return;
    }

    const { call, error } = callService.createCall({
      callId,
      caller: username,
      receiver: to,
      type,
      teamName,
      callerSocketId: socket.id,
      receiverSocketId: targetSocketId,
      offer,
    });

    if (error) {
      const message = error === 'busy' ? 'User is busy' : 'Call already exists';
      socket.emit('call:failed', { reason: error, message });
      socket.emit('call-failed', { message });
      return;
    }

    console.log(`📞 Call initiated: ${call.callId} (${username} -> ${to}, ${type})`);
    callService.setStatus(call.callId, 'RINGING');
    callService.startTimeout(call.callId, handleCallTimeout);

    socket.emit('call:initiated', { callId: call.callId, to, type });

    io.to(targetSocketId).emit('call:incoming', {
      callId: call.callId,
      from: username,
      type,
      offer,
      startedAt: call.startedAt,
    });

    io.to(targetSocketId).emit('call:offer', {
      callId: call.callId,
      from: username,
      type,
      offer,
    });

    io.to(targetSocketId).emit('incoming-call', {
      from: username,
      offer,
      type,
      callerSocket: socket.id,
    });
  };

  socket.on('call:initiate', handleCallInitiate);

  const handleCallAccept = ({ callId, answer }) => {
    const call = callService.getCall(callId);
    if (!call) {
      socket.emit('call:failed', { reason: 'not-found', message: 'Call not found' });
      socket.emit('call-failed', { message: 'Call not found' });
      return;
    }
    if (call.receiver !== username) {
      socket.emit('call:failed', { reason: 'forbidden', message: 'Not authorized' });
      socket.emit('call-failed', { message: 'Not authorized' });
      return;
    }
    if (!['CALLING', 'RINGING'].includes(call.status)) {
      socket.emit('call:failed', { reason: 'invalid-state', message: 'Call not ringable' });
      return;
    }

    console.log(`📞 Call accepted: ${callId} by ${username}`);
    callService.clearTimeout(call);
    callService.setStatus(callId, 'ACCEPTED', { answer });

    emitToUser(call.caller, 'call:accepted', { callId, from: username, type: call.type });
    emitToUser(call.receiver, 'call:accepted', { callId, from: username, type: call.type });
    emitToUser(call.caller, 'call:answer', { callId, from: username, answer });
    emitToUser(call.caller, 'call-accepted', { answer, from: username });
  };

  socket.on('call:accept', handleCallAccept);

  const handleCallReject = ({ callId, reason }) => {
    const call = callService.getCall(callId);
    if (!call) return;
    if (call.receiver !== username) return;
    if (call.status !== 'RINGING') return;

    console.log(`📞 Call rejected: ${callId} by ${username}`);
    callService.clearTimeout(call);
    callService.setStatus(callId, 'REJECTED', { reason: reason || 'rejected' });

    emitToUser(call.caller, 'call:reject', {
      callId,
      from: username,
      reason: reason || 'rejected',
    });
    emitToUser(call.receiver, 'call:rejected', {
      callId,
      from: username,
      reason: reason || 'rejected',
    });
    emitToUser(call.caller, 'call-rejected', { from: username });
    scheduleCallCleanup(callId);
  };

  socket.on('call:reject', handleCallReject);

  const handleCallCancel = ({ callId, reason }) => {
    const call = callService.getCall(callId);
    if (!call) return;
    if (call.caller !== username) return;
    if (!['CALLING', 'RINGING'].includes(call.status)) return;

    console.log(`📞 Call cancelled: ${callId} by ${username}`);
    callService.clearTimeout(call);
    callService.setStatus(callId, 'CANCELLED', { reason: reason || 'cancelled' });

    emitToUser(call.receiver, 'call:cancel', {
      callId,
      from: username,
      reason: reason || 'cancelled',
    });
    emitToUser(call.caller, 'call:cancelled', {
      callId,
      from: username,
      reason: reason || 'cancelled',
    });
    emitToUser(call.receiver, 'end-call', { from: username });
    scheduleCallCleanup(callId);
  };

  socket.on('call:cancel', handleCallCancel);

  const handleCallEnd = ({ callId, reason }) => {
    const call = callService.getCall(callId);
    if (!call) return;
    if (call.caller !== username && call.receiver !== username) return;

    console.log(`📞 Call ended: ${callId} by ${username}`);
    callService.clearTimeout(call);
    callService.setStatus(callId, 'ENDED', { reason: reason || 'ended' });

    const otherUser = call.caller === username ? call.receiver : call.caller;
    emitToUser(otherUser, 'call:end', {
      callId,
      from: username,
      reason: reason || 'ended',
    });
    emitToUser(otherUser, 'end-call', { from: username });
    scheduleCallCleanup(callId);
  };

  socket.on('call:end', handleCallEnd);

  const handleCallIceCandidate = ({ callId, candidate }) => {
    const call = callService.getCall(callId);
    if (!call) return;
    if (call.caller !== username && call.receiver !== username) return;
    const otherUser = call.caller === username ? call.receiver : call.caller;
    emitToUser(otherUser, 'call:ice-candidate', { callId, candidate, from: username });
  };

  socket.on('call:ice-candidate', handleCallIceCandidate);

  socket.on('call:offer', ({ callId, offer }) => {
    const call = callService.getCall(callId);
    if (!call) return;
    if (call.caller !== username && call.receiver !== username) return;
    if (call.status !== 'ACCEPTED') return;
    const otherUser = call.caller === username ? call.receiver : call.caller;
    emitToUser(otherUser, 'call:offer', { callId, offer, from: username, type: call.type });
  });

  socket.on('call:answer', ({ callId, answer }) => {
    const call = callService.getCall(callId);
    if (!call) return;
    if (call.caller !== username && call.receiver !== username) return;
    if (call.status !== 'ACCEPTED') return;
    const otherUser = call.caller === username ? call.receiver : call.caller;
    emitToUser(otherUser, 'call:answer', { callId, answer, from: username });
  });

  /* ===== Legacy WebRTC events (backward compatibility) ===== */
  socket.on('call-user', ({ username: targetUsername, offer, type = 'video' }) => {
    handleCallInitiate({ to: targetUsername, offer, type });
  });

  socket.on('call-accepted', ({ to, answer }) => {
    const legacyCall = findLegacyCall(to);
    if (!legacyCall) {
      socket.emit('call-failed', { message: 'Call not found' });
      return;
    }
    handleCallAccept({ callId: legacyCall.callId, answer });
  });

  socket.on('call-rejected', ({ to }) => {
    const legacyCall = findLegacyCall(to);
    if (!legacyCall) return;
    handleCallReject({ callId: legacyCall.callId, reason: 'rejected' });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    const legacyCall = findLegacyCall(to);
    if (!legacyCall) return;
    handleCallIceCandidate({ callId: legacyCall.callId, candidate });
  });

  socket.on('end-call', ({ to }) => {
    const legacyCall = findLegacyCall(to);
    if (!legacyCall) return;
    handleCallEnd({ callId: legacyCall.callId, reason: 'ended' });
  });

  /* ========== AI CODE REVIEW ========== */
  socket.on('get-review', async ({ projectId, code, language }) => {
    if (!projectId || !code) {
      socket.emit('error', { message: 'Invalid review request' });
      return;
    }

    try {
      console.log(`Generating AI review for project ${projectId}`);

      // Import AI service
      const { default: AIService } = await import('./src/services/ai.service.js');
      const result = await AIService.reviewCode(code, language);
      const projectRoom = roomManager.getProjectRoomId(teamName, projectId);

      io.to(projectRoom).emit('code-review', {
        projectId,
        success: result.success,
        review: result.review,
        reason: result.reason,
      });

      console.log(`Review sent to project ${projectId} | success=${result.success}`);
    } catch (error) {
      console.error('AI review error:', error);

      const projectRoom = roomManager.getProjectRoomId(teamName, projectId);
      io.to(projectRoom).emit('code-review', {
        projectId,
        success: false,
        review: '⚠️ AI review unavailable. Using offline analysis.',
        reason: 'AI_FAILED',
      });
    }
  });

  /* ========== DISCONNECT ========== */

  socket.on('disconnect', reason => {
    console.log(`🔌 Client disconnected: ${username} (${reason})`);

    const connection = roomManager.getConnection(socket.id);

    const activeCall = callService.findActiveCallByUser(teamName, username);
    if (activeCall && !['REJECTED', 'CANCELLED', 'ENDED', 'FAILED'].includes(activeCall.status)) {
      callService.clearTimeout(activeCall);
      callService.setStatus(activeCall.callId, 'ENDED', { reason: 'user-disconnected' });
      const otherUser =
        activeCall.caller === username ? activeCall.receiver : activeCall.caller;
      emitToUser(otherUser, 'call:user-disconnected', {
        callId: activeCall.callId,
        from: username,
        reason: 'user-disconnected',
      });
      emitToUser(otherUser, 'call:end', {
        callId: activeCall.callId,
        from: username,
        reason: 'user-disconnected',
      });
      emitToUser(otherUser, 'end-call', { from: username });
      scheduleCallCleanup(activeCall.callId);
    }

    if (connection?.currentProjectId) {
      const projectRoom = roomManager.getProjectRoomId(teamName, connection.currentProjectId);

      // Notify project room
      socket.to(projectRoom).emit('user-left-project', {
        username,
        projectId: connection.currentProjectId,
      });

      // Update active users
      setTimeout(() => {
        const activeUsers = roomManager.getProjectUsers(teamName, connection.currentProjectId);
        io.to(projectRoom).emit('active-users', {
          projectId: connection.currentProjectId,
          users: activeUsers.map(u => u.username),
        });
      }, 100);
    }

    // Notify team
    const teamRoom = roomManager.getTeamRoomId(teamName);
    socket.to(teamRoom).emit('user-offline', {
      username,
      timestamp: Date.now(),
    });

    roomManager.removeConnection(socket.id);
  });

  /* ========== ERROR HANDLING ========== */

  socket.on('error', error => {
    console.error(`Socket error for ${username}:`, error);
  });
});

/* -------------------- START SERVER -------------------- */

server.listen(config.PORT, () => {
  console.log(`Server running on port => ${config.PORT}`);
});

export { io, roomManager };
