import http from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketServer } from 'socket.io';
import app from './src/app.js';
import config from './src/config/config.js';
import connectToDb from './src/db/db.js';
import messageService from './src/services/message.service.js';

connectToDb();

/* -------------------- SERVER SETUP -------------------- */

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: config.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
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

  socket.on('call-user', ({ username: targetUsername, offer, type = 'video' }) => {
    const targetSocketId = roomManager.getUserSocketId(teamName, targetUsername);

    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming-call', {
        from: username,
        offer,
        type,
        callerSocket: socket.id,
      });
    } else {
      socket.emit('call-failed', {
        message: 'User not available',
      });
    }
  });

  socket.on('call-accepted', ({ to, answer }) => {
    io.to(to).emit('call-accepted', { answer });
  });

  socket.on('call-rejected', ({ to }) => {
    io.to(to).emit('call-rejected');
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { candidate });
  });

  socket.on('end-call', ({ to }) => {
    io.to(to).emit('end-call');
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

      // Generate review
      const review = await AIService.reviewCode(code, language);

      const projectRoom = roomManager.getProjectRoomId(teamName, projectId);

      // Send review to all users in project
      io.to(projectRoom).emit('code-review', {
        projectId,
        review,
      });

      console.log(`Review sent to project ${projectId}`);
    } catch (error) {
      console.error('AI review error:', error);
      socket.emit('error', {
        message: 'Failed to generate review',
        error: error.message,
      });
    }
  });

  /* ========== DISCONNECT ========== */

  socket.on('disconnect', reason => {
    console.log(`🔌 Client disconnected: ${username} (${reason})`);

    const connection = roomManager.getConnection(socket.id);

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
