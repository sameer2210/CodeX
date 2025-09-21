import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    connected: false,
    error: null,
  },
  reducers: {
    socketConnected: state => {
      state.connected = true;
      state.error = null;
    },
    socketDisconnected: state => {
      state.connected = false;
    },
    socketError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { socketConnected, socketDisconnected, socketError } = socketSlice.actions;
export default socketSlice.reducer;
