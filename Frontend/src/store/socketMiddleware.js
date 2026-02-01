// store/socketMiddleware.js
import { io } from 'socket.io-client';
import { notify } from '../lib/notify';
import {
  addChatMessage,
  addTypingUser,
  removeTypingUser,
  setActiveUsers,
  setChatMessages,
  setProjectJoined,
  updateProjectCode,
  updateProjectReview,
} from './slices/projectSlice';
import {
  socketConnected,
  socketConnecting,
  socketDisconnected,
  socketError,
} from './slices/socketSlice';

let socket = null;
let pendingActions = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const socketMiddleware = store => next => action => {
  /* ========== SOCKET INITIALIZATION ========== */

  if (action.type === 'socket/init') {
    if (socket?.connected) {
      console.log('Socket already connected');
      return next(action);
    }

    const token = localStorage.getItem('codex_token');

    if (!token) {
      console.warn('No auth token found');
      return next(action);
    }

    store.dispatch(socketConnecting());

    socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      timeout: 20000,
      upgrade: true,
    });

    /* ===== CONNECTION EVENTS ===== */

    socket.on('connect', () => {
      reconnectAttempts = 0;
      store.dispatch(socketConnected());
      notify('Connected to server', 'success');
      console.log('Socket connected:', socket.id);
      pendingActions.forEach(action => store.dispatch(action));
      pendingActions = [];
    });

    socket.on('disconnect', reason => {
      store.dispatch(socketDisconnected());
      console.log('Socket disconnected:', reason);

      if (reason === 'io server disconnect') {
        notify('Disconnected by server. Please refresh.', 'error');
      }
    });

    socket.on('connect_error', err => {
      reconnectAttempts++;
      store.dispatch(socketError(err.message));
      console.error('Connection error:', err.message);

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        notify('Unable to connect. Please check your connection.', 'error');
      }
    });

    socket.on('reconnect', attemptNumber => {
      reconnectAttempts = 0;
      store.dispatch(socketConnected());
      notify(`Reconnected after ${attemptNumber} attempts`, 'success');
      console.log('Reconnected');
    });

    socket.on('reconnect_failed', () => {
      notify('Failed to reconnect. Please refresh the page.', 'error');
    });

    socket.on('error', err => {
      store.dispatch(socketError(err.message || 'Socket error'));
      notify(err.message || 'An error occurred', 'error');
    });

    /* ===== PROJECT ROOM EVENTS ===== */

    socket.on('project-joined', ({ projectId, success }) => {
      if (success) {
        store.dispatch(setProjectJoined({ projectId, joined: true }));
        console.log('✅ Joined project:', projectId);

        socket.emit('get-chat-history', { projectId });
        socket.emit('get-project-code', { projectId });
      }
    });

    socket.on('user-joined-project', ({ username, projectId, timestamp }) => {
      const currentUser = store.getState().auth.user?.username;

      if (username !== currentUser) {
        store.dispatch(
          addChatMessage({
            projectId,
            message: {
              _id: `system_${Date.now()}_${Math.random()}`,
              username: 'System',
              message: `${username} joined the project`,
              type: 'system',
              createdAt: timestamp || new Date().toISOString(),
            },
          })
        );
      }
    });

    socket.on('user-left-project', ({ username, projectId }) => {
      const currentUser = store.getState().auth.user?.username;

      if (username !== currentUser) {
        store.dispatch(
          addChatMessage({
            projectId,
            message: {
              _id: `system_${Date.now()}_${Math.random()}`,
              username: 'System',
              message: `${username} left the project`,
              type: 'system',
              createdAt: new Date().toISOString(),
            },
          })
        );
      }
    });

    socket.on('active-users', ({ projectId, users }) => {
      const currentUser = store.getState().auth.user?.username;
      const filteredUsers = users.filter(user => user !== currentUser);
      store.dispatch(setActiveUsers({ projectId, users: filteredUsers }));
      console.log('👥 Active users:', filteredUsers);
    });

    /* ===== CHAT EVENTS ===== */

    socket.on('chat-history', ({ projectId, messages }) => {
      if (Array.isArray(messages)) {
        const formattedMessages = messages.map(msg => ({
          ...msg,
          _id: msg._id || `msg_${Date.now()}_${Math.random()}`,
          username: msg.username || 'Unknown',
          message: msg.text || msg.message || '',
          createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
        }));

        store.dispatch(setChatMessages({ projectId, messages: formattedMessages }));
        console.log(`📜 Loaded ${messages.length} messages for project ${projectId}`);
      }
    });

    socket.on('chat-message', ({ projectId, message }) => {
      const formattedMessage = {
        ...message,
        _id: message._id || `msg_${Date.now()}_${Math.random()}`,
        message: message.text || message.message || '',
        createdAt: message.createdAt || message.timestamp || new Date().toISOString(),
      };

      store.dispatch(addChatMessage({ projectId, message: formattedMessage }));
    });

    socket.on('user-typing', ({ projectId, username, isTyping }) => {
      const currentUser = store.getState().auth.user?.username;

      if (username !== currentUser) {
        if (isTyping) {
          store.dispatch(addTypingUser({ projectId, username }));
        } else {
          store.dispatch(removeTypingUser({ projectId, username }));
        }
      }
    });

    /* ===== CODE COLLABORATION EVENTS ===== */

    socket.on('code-change', ({ projectId, code, delta, cursorPos, username }) => {
      const currentUser = store.getState().auth.user?.username;

      if (username !== currentUser) {
        store.dispatch(updateProjectCode({ projectId, code, delta, cursorPos, username }));
        console.log(`Code updated by ${username}`);
      }
    });

    socket.on('project-code', ({ projectId, code }) => {
      store.dispatch(updateProjectCode({ projectId, code }));
      console.log(`Project code loaded for ${projectId}`);
    });

    socket.on('code-review', ({ projectId, review, success, error }) => {
      console.log('🤖 AI Review received:', {
        projectId,
        success,
        review: review?.substring(0, 100),
      });

      if (success && review) {
        store.dispatch(updateProjectReview({ projectId, review }));
        notify('AI review completed!', 'success');
      } else if (error) {
        const errorReview = `❌ **AI Review Failed**\n\n${error}\n\nPlease check:\n- Your API key is configured correctly\n- The backend service is running\n- Try again in a moment`;
        store.dispatch(updateProjectReview({ projectId, review: errorReview }));
        notify('AI review failed', 'error');
      } else {
        const fallbackReview =
          '⚠️ **No Review Generated**\n\nThe AI service returned an empty response. Please try again.';
        store.dispatch(updateProjectReview({ projectId, review: fallbackReview }));
        notify('No review generated', 'warning');
      }
    });

    socket.on('review-error', ({ projectId, error, message }) => {
      console.error('❌ Review error:', error, message);
      const errorReview = `❌ **AI Review Error**\n\n${message || error || 'An unknown error occurred'}\n\nTroubleshooting:\n- Check if GOOGLE_API_KEY is set in backend .env\n- Verify Gemini API is accessible\n- Check backend logs for details`;
      store.dispatch(updateProjectReview({ projectId, review: errorReview }));
      notify('Review generation failed', 'error');
    });

    /* ===== WEBRTC CALL SIGNALING EVENTS ===== */

    socket.on('incoming-call', ({ from, offer, type, callerSocket }) => {
      console.log('Incoming call from:', from, 'Type:', type);
      notify(`Incoming ${type} call from ${from}`, 'info');

      window.dispatchEvent(
        new CustomEvent('incoming-call', {
          detail: { from, offer, type, callerSocket },
        })
      );
    });

    socket.on('call-accepted', ({ answer, from }) => {
      console.log('Call accepted by:', from);

      window.dispatchEvent(
        new CustomEvent('call-accepted', {
          detail: { answer, from },
        })
      );
    });

    socket.on('call-rejected', ({ from }) => {
      console.log('Call rejected by:', from);
      notify(`${from} rejected the call`, 'warning');

      window.dispatchEvent(
        new CustomEvent('call-rejected', {
          detail: { from },
        })
      );
    });

    socket.on('call-failed', ({ message }) => {
      console.error('Call failed:', message);
      notify(message || 'Call failed', 'error');
    });

    socket.on('end-call', ({ from }) => {
      console.log('Call ended by:', from);

      window.dispatchEvent(
        new CustomEvent('end-call', {
          detail: { from },
        })
      );
    });

    socket.on('ice-candidate', ({ candidate, from }) => {
      console.log('Received ICE candidate from:', from);

      window.dispatchEvent(
        new CustomEvent('ice-candidate', {
          detail: { candidate, from },
        })
      );
    });

    /* ===== TEAM EVENTS ===== */

    socket.on('user-online', ({ username, timestamp }) => {
      console.log('User online:', username);
    });

    socket.on('user-offline', ({ username, timestamp }) => {
      console.log('User offline:', username);
    });
  }

  /* ========== SOCKET ACTIONS ========== */

  if (socket?.connected && action.type.startsWith('socket/')) {
    switch (action.type) {
      case 'socket/joinProject':
        console.log('Joining project:', action.payload.projectId);
        socket.emit('join-project', {
          projectId: action.payload.projectId || action.payload,
        });
        break;

      case 'socket/leaveProject':
        console.log('Leaving project:', action.payload.projectId);
        socket.emit('leave-project', {
          projectId: action.payload.projectId || action.payload,
        });
        break;

      case 'socket/sendChatMessage':
        socket.emit('chat-message', {
          projectId: action.payload.projectId,
          text: action.payload.text,
        });
        break;

      case 'socket/typingStart':
        socket.emit('typing-start', {
          projectId: action.payload.projectId,
        });
        break;

      case 'socket/typingStop':
        socket.emit('typing-stop', {
          projectId: action.payload.projectId,
        });
        break;

      case 'socket/codeChange':
        socket.emit('code-change', {
          projectId: action.payload.projectId,
          code: action.payload.code,
          delta: action.payload.delta,
          cursorPos: action.payload.cursorPos,
        });
        break;

      case 'socket/getReview':
        console.log('🤖 Requesting AI review for project:', action.payload.projectId);
        socket.emit('get-review', {
          projectId: action.payload.projectId,
          code: action.payload.code,
          language: action.payload.language,
        });
        break;

      /* ===== WEBRTC SIGNALING ACTIONS ===== */

      case 'socket/callUser':
        console.log('Calling user:', action.payload.username, 'Type:', action.payload.type);
        socket.emit('call-user', {
          username: action.payload.username,
          offer: action.payload.offer,
          type: action.payload.type,
        });
        break;

      case 'socket/callAccepted':
        console.log('Accepting call, sending answer to:', action.payload.to);
        socket.emit('call-accepted', {
          to: action.payload.to,
          answer: action.payload.answer,
        });
        break;

      case 'socket/callRejected':
        console.log('Rejecting call from:', action.payload.to);
        socket.emit('call-rejected', {
          to: action.payload.to,
        });
        break;

      case 'socket/iceCandidate':
        console.log('Sending ICE candidate to:', action.payload.to);
        socket.emit('ice-candidate', {
          to: action.payload.to,
          candidate: action.payload.candidate,
        });
        break;

      case 'socket/endCall':
        console.log('Ending call with:', action.payload.to);
        socket.emit('end-call', {
          to: action.payload.to,
        });
        break;

      case 'socket/disconnect':
        if (socket) {
          socket.disconnect();
          socket = null;
        }
        break;

      default:
        break;
    }
  } else if (action.type.startsWith('socket/') && action.type !== 'socket/init') {
    pendingActions.push(action);
    console.warn('⚠️ Socket not connected, queuing action:', action.type);
  }

  return next(action);
};

export const getSocket = () => socket;
