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
    connectionStatus: 'disconnected',
    isConnecting: false,
    messages: [],
    toasts: [],
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Persist to localStorage
      localStorage.setItem('codex_theme', JSON.stringify(state.isDarkMode));
      // Update document class
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
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    setIsConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
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

export const {
  toggleTheme,
  setTheme,
  setConnectionStatus,
  setIsConnecting,
  addMessage,
  setMessages,
  addToast,
  removeToast,
} = uiSlice.actions;
export default uiSlice.reducer;

