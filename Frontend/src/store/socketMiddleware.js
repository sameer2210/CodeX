import { io } from 'socket.io-client';

import { socketConnected, socketDisconnected, socketError } from './slices/socketSlice';

let socket;

export const socketMiddleware = (store) => (next) => (action) => {
  if (action.type === 'socket/init') {
    if (!socket) {
      socket = io(import.meta.env.VITE_BACKEND_URL, {
        transports: ['websocket'],
        reconnection: true,
      });
      socket.on('connect', () => store.dispatch(socketConnected()));
      socket.on('disconnect', () => store.dispatch(socketDisconnected()));
      socket.on('error', (err) => store.dispatch(socketError(err.message)));

      socket.on('chat:message', msg => {
        store.dispatch({ type: 'project/addChatMessage', payload: msg });
      });
    }
  }
  if (action.type === "socket/sendMessage") {
    socket?.emit("chat:message", action.payload)
  }
  return next(action);
};
