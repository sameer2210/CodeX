import { io } from 'socket.io-client';

import {
  socketConnecting,
  socketConnected,
  socketDisconnected,
  socketError,
} from './slices/socketSlice';
import {
  addChatMessage,
  setChatMessages,
  updateProjectCode,
  updateProjectReview,
  setActiveUsers,
  addTypingUser,
  removeTypingUser,
  setProjectJoined,
} from './slices/projectSlice';
import { addToast } from './slices/uiSlice';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const socketMiddleware = store => next => action => {
  /* ========== SOCKET INITIALIZATION ========== */

  if (action.type === 'socket/init') {
    if (socket?.connected) {
      console.log('✅ Socket already connected');
      return next(action);
    }

    const token = localStorage.getItem('codex_token');

    if (!token) {
      console.warn('⚠️ No auth token found');
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
      store.dispatch(
        addToast({
          message: 'Connected to server',
          type: 'success',
        })
      );
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', reason => {
      store.dispatch(socketDisconnected());
      console.log('🔌 Socket disconnected:', reason);

      if (reason === 'io server disconnect') {
        store.dispatch(
          addToast({
            message: 'Disconnected by server. Please refresh.',
            type: 'error',
          })
        );
      }
    });

    socket.on('connect_error', err => {
      reconnectAttempts++;
      store.dispatch(socketError(err.message));
      console.error('❌ Connection error:', err.message);

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        store.dispatch(
          addToast({
            message: 'Unable to connect. Please check your connection.',
            type: 'error',
          })
        );
      }
    });

    socket.on('reconnect', attemptNumber => {
      reconnectAttempts = 0;
      store.dispatch(socketConnected());
      store.dispatch(
        addToast({
          message: `Reconnected after ${attemptNumber} attempts`,
          type: 'success',
        })
      );
      console.log('🔄 Reconnected');
    });

    socket.on('reconnect_failed', () => {
      store.dispatch(
        addToast({
          message: 'Failed to reconnect. Please refresh the page.',
          type: 'error',
        })
      );
    });

    socket.on('error', err => {
      store.dispatch(socketError(err.message || 'Socket error'));
      store.dispatch(
        addToast({
          message: err.message || 'An error occurred',
          type: 'error',
        })
      );
    });

    /* ===== PROJECT ROOM EVENTS ===== */

    socket.on('project-joined', ({ projectId, success }) => {
      if (success) {
        store.dispatch(setProjectJoined({ projectId, joined: true }));
        console.log('✅ Joined project:', projectId);
      }
    });

    socket.on('user-joined-project', ({ username, projectId, timestamp }) => {
      const currentUser = store.getState().auth.user?.username;

      if (username !== currentUser) {
        store.dispatch(
          addChatMessage({
            projectId,
            message: {
              _id: `system_${Date.now()}`,
              username: 'System',
              message: `${username} joined the project`,
              type: 'system',
              createdAt: new Date(timestamp).toISOString(),
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
              _id: `system_${Date.now()}`,
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
        store.dispatch(setChatMessages({ projectId, messages }));
        console.log(`📜 Loaded ${messages.length} messages for project ${projectId}`);
      }
    });

    socket.on('chat-message', ({ projectId, message }) => {
      store.dispatch(addChatMessage({ projectId, message }));
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
      }
    });

    socket.on('project-code', ({ projectId, code }) => {
      store.dispatch(updateProjectCode({ projectId, code }));
    });

    socket.on('code-review', ({ projectId, review }) => {
      store.dispatch(updateProjectReview({ projectId, review }));
      store.dispatch(
        addToast({
          message: 'AI review completed!',
          type: 'success',
        })
      );
    });

    /* ===== CALL EVENTS ===== */

    socket.on('incoming-call', ({ from, offer, type, callerSocket }) => {
      store.dispatch(
        addToast({
          message: `Incoming ${type} call from ${from}`,
          type: 'info',
        })
      );
      // Handle call UI here
    });

    socket.on('call-accepted', ({ answer }) => {
      // Handle call acceptance
    });

    socket.on('call-rejected', () => {
      store.dispatch(
        addToast({
          message: 'Call was rejected',
          type: 'warning',
        })
      );
    });

    socket.on('call-failed', ({ message }) => {
      store.dispatch(
        addToast({
          message: message || 'Call failed',
          type: 'error',
        })
      );
    });

    socket.on('end-call', () => {
      // Handle call end
    });

    socket.on('ice-candidate', ({ candidate }) => {
      // Handle ICE candidate
    });

    /* ===== TEAM EVENTS ===== */

    socket.on('user-online', ({ username, timestamp }) => {
      console.log('✅ User online:', username);
    });

    socket.on('user-offline', ({ username, timestamp }) => {
      console.log('❌ User offline:', username);
    });
  }

  /* ========== SOCKET ACTIONS ========== */

  if (socket?.connected && action.type.startsWith('socket/')) {
    switch (action.type) {
      case 'socket/joinProject':
        socket.emit('join-project', {
          projectId: action.payload.projectId || action.payload,
        });
        break;

      case 'socket/leaveProject':
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
          delta: action.payload.delta,
          code: action.payload.code,
          cursorPos: action.payload.cursorPos,
        });
        break;

      case 'socket/getReview':
        socket.emit('get-review', {
          projectId: action.payload.projectId,
        });
        break;

      case 'socket/callUser':
        socket.emit('call-user', {
          username: action.payload.username,
          offer: action.payload.offer,
          type: action.payload.type,
        });
        break;

      case 'socket/callAccepted':
        socket.emit('call-accepted', {
          to: action.payload.to,
          answer: action.payload.answer,
        });
        break;

      case 'socket/callRejected':
        socket.emit('call-rejected', {
          to: action.payload.to,
        });
        break;

      case 'socket/iceCandidate':
        socket.emit('ice-candidate', {
          to: action.payload.to,
          candidate: action.payload.candidate,
        });
        break;

      case 'socket/endCall':
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
  }

  return next(action);
};

export const getSocket = () => socket;
