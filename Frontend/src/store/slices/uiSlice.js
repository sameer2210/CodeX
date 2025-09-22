// Updated uiSlice.js
// Removed messages, addMessage, setMessages since moved to projectSlice.
// Kept the rest.
// Adjusted getInitialTheme to return boolean for isDarkMode.

import { createSlice } from '@reduxjs/toolkit';

// Get initial theme from localStorage
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('codex_theme');
  return savedTheme ? JSON.parse(savedTheme) : true;
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isDarkMode: getInitialTheme(),
    toasts: [],
  },
  reducers: {
    toggleTheme: state => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('codex_theme', JSON.stringify(state.isDarkMode));
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
      localStorage.setItem('codex_theme', JSON.stringify(state.isDarkMode));
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    addToast: (state, action) => {
      state.toasts.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
  },
});

export const { toggleTheme, setTheme, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
