//authSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import api from '../../api/config';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || 'Login failed');
      }

      localStorage.setItem('codex_token', response.data.token);
      localStorage.setItem('codex_team', response.data.user.teamName);
      localStorage.setItem('codex_username', response.data.user.username);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || 'Registration failed');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

const getInitialAuthState = () => {
  const token = localStorage.getItem('codex_token');
  if (!token)
    return { user: { username: null, teamName: null }, token: null, isAuthenticated: false };

  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    if (tokenData.exp < Date.now() / 1000) {
      localStorage.clear();
      return { user: { username: null, teamName: null }, token: null, isAuthenticated: false };
    }
    return {
      user: {
        username: localStorage.getItem('codex_username'),
        teamName: localStorage.getItem('codex_team'),
      },
      token,
      isAuthenticated: true,
    };
  } catch {
    localStorage.clear();
    return { user: { username: null, teamName: null }, token: null, isAuthenticated: false };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...getInitialAuthState(),
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: state => {
      state.user = { username: null, teamName: null };
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.clear();
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(REHYDRATE, state => {
        // Prevent stuck loading state after refresh or failed auth attempts
        state.isLoading = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
