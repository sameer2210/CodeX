// store.js
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { notify } from '../lib/notify';
import authSlice from './slices/authSlice';
import callSlice from './slices/callSlice';
import projectSlice from './slices/projectSlice';
import socketSlice from './slices/socketSlice';
import { socketMiddleware } from './socketMiddleware';

// Root reducer with persistence config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Persist only auth slice (add others if needed, e.g., ['auth', 'projects'])
};

const rootReducer = combineReducers({
  socket: socketSlice,
  auth: authSlice,
  call: callSlice,
  projects: projectSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Error logging middleware (for rejected actions)
const errorLogger = store => next => action => {
  if (action.meta?.rejectedWithValue) {
    const message = action.payload || 'Something went wrong';
    console.error('Rejected action:', action.type, message);
    notify(message, 'error');
  }
  return next(action);
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        ignoredPaths: [
          'call.localStream',
          'call.remoteStream',
          'call.peerConnection',
        ],
      },
    }).concat(socketMiddleware, errorLogger),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
