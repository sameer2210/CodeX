// Updated socketMiddleware.js to match the new slices.
// Changed addChatMessage, setChatMessages to projectSlice.
// Added dispatch(socketConnecting()) on init.
// Updated imports accordingly.
// For chat:message, use addChatMessage.
// For code-change and project-code, dispatch(updateProjectCode(newCode)).
// For code-review, dispatch(updateProjectReview(reviewText)).
// Added currentUser as state.auth.user.username.

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
} from './slices/projectSlice';
import { addToast } from './slices/uiSlice';

let socket;

export const socketMiddleware = store => next => action => {
  if (action.type === 'socket/init') {
    if (!socket) {
      store.dispatch(socketConnecting());
      socket = io(import.meta.env.VITE_BACKEND_URL, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        upgrade: true,
      });

      socket.on('connect', () => {
        store.dispatch(socketConnected());
        store.dispatch(addToast({ message: 'Connected to server', type: 'success' }));
      });

      socket.on('disconnect', reason => {
        store.dispatch(socketDisconnected());
        store.dispatch(
          addToast({
            message: `Disconnected: ${reason}. Attempting to reconnect...`,
            type: 'error',
          })
        );
      });

      socket.on('error', err => {
        store.dispatch(socketError(err.message));
      });

      socket.on('connect_error', err => {
        store.dispatch(socketError(err.message));
        store.dispatch(
          addToast({
            message: `Connection failed: ${err.message}. Working in offline mode.`,
            type: 'error',
          })
        );
      });

      socket.on('reconnect', attempt => {
        store.dispatch(socketConnected());
        store.dispatch(
          addToast({ message: `Reconnected after ${attempt} attempts`, type: 'success' })
        );
      });

      socket.on('reconnect_error', err => {
        store.dispatch(socketError(err.message));
      });

      socket.on('chat:message', msg => {
        store.dispatch(addChatMessage(msg));
      });

      socket.on('chat-history', messages => {
        if (Array.isArray(messages)) {
          const formattedMessages = messages.map((message, index) => ({
            text: message.text || message,
            user: message.user || 'Anonymous',
            timestamp: message.timestamp || Date.now() - (messages.length - index) * 1000,
            type: message.type || 'user',
            id: message.id || 'history_' + index,
          }));
          store.dispatch(setChatMessages(formattedMessages));
        }
      });

      socket.on('code-change', newCode => {
        if (typeof newCode === 'string') {
          store.dispatch(updateProjectCode(newCode));
        }
      });

      socket.on('project-code', projectCode => {
        if (typeof projectCode === 'string') {
          store.dispatch(updateProjectCode(projectCode));
        }
      });

      socket.on('code-review', reviewText => {
        store.dispatch(updateProjectReview(reviewText || 'No review available'));
      });

      socket.on('active-users', users => {
        if (Array.isArray(users)) {
          const currentUser = store.getState().auth.user?.username || 'Anonymous';
          store.dispatch(setActiveUsers(users.filter(user => user !== currentUser)));
        }
      });

      socket.on('user-joined', user => {
        store.dispatch(
          addChatMessage({
            text: `${user} joined the project`,
            user: 'System',
            timestamp: Date.now(),
            type: 'system',
            id: 'join_' + Date.now(),
          })
        );
      });

      socket.on('user-left', user => {
        store.dispatch(
          addChatMessage({
            text: `${user} left the project`,
            user: 'System',
            timestamp: Date.now(),
            type: 'system',
            id: 'leave_' + Date.now(),
          })
        );
      });
    }
  }

  if (socket && action.type.startsWith('socket/')) {
    switch (action.type) {
      case 'socket/sendChatMessage':
        socket.emit('chat-message', action.payload);
        break;
      case 'socket/codeChange':
        socket.emit('code-change', action.payload);
        break;
      case 'socket/getReview':
        socket.emit('get-review', action.payload);
        break;
      case 'socket/joinProject':
        socket.emit('join-project', action.payload);
        break;
      case 'socket/leaveProject':
        socket.emit('leave-project', action.payload);
        break;
      case 'socket/requestChatHistory':
        socket.emit('chat-history');
        break;
      case 'socket/getProjectCode':
        socket.emit('get-project-code');
        break;
      default:
        break;
    }
  }

  return next(action);
};
