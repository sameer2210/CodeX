//store.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import projectSlice from './slices/projectSlice';
import socketSlice from './slices/socketSlice';
import { socketMiddleware } from './socketMiddleware';

export const store = configureStore({
  reducer: {
    socket: socketSlice,
    auth: authSlice,
    projects: projectSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(socketMiddleware),
});
