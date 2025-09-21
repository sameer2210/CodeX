import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import projectSlice from './slices/projectSlice';
import socketSlice from './slices/socketSlice';
import uiSlice from './slices/uiSlice';
import { socketMiddleware } from './socketMiddleware';

export const store = configureStore({
  reducer: {
    socket: socketSlice,
    auth: authSlice,
    projects: projectSlice,
    ui: uiSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(socketMiddleware),
});

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
