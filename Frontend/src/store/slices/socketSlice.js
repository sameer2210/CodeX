import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    connected: false,
    error: null,
    connectionStatus: 'disconnected',
    isConnecting: false,
  },
  reducers: {
    socketConnecting: state => {
      state.isConnecting = true;
      state.connectionStatus = 'connecting';
      state.error = null;
    },
    socketConnected: state => {
      state.connected = true;
      state.error = null;
      state.connectionStatus = 'connected';
      state.isConnecting = false;
    },
    socketDisconnected: state => {
      state.connected = false;
      state.connectionStatus = 'disconnected';
      state.isConnecting = false;
    },
    socketError: (state, action) => {
      state.error = action.payload;
      state.connectionStatus = 'error';
      state.isConnecting = false;
    },
  },
});

export const { socketConnecting, socketConnected, socketDisconnected, socketError } =
  socketSlice.actions;
export default socketSlice.reducer;
