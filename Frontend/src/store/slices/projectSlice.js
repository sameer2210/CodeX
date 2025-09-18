import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/config';

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects/get-all');
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects/create', projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    stats: {
      totalProjects: 0,
      activeProjects: 0,
      teamMembers: 1,
      completedTasks: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    updateProjectCode: (state, action) => {
      if (state.currentProject) {
        state.currentProject.code = action.payload;
      }
    },
    updateProjectReview: (state, action) => {
      if (state.currentProject) {
        state.currentProject.review = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
        state.stats = {
          totalProjects: action.payload.length,
          activeProjects: action.payload.filter(p => p.status !== 'completed').length,
          teamMembers: 1,
          completedTasks: action.payload.filter(p => p.status === 'completed').length,
        };
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.projects = [];
      })
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentProject, updateProjectCode, updateProjectReview, clearError } = projectSlice.actions;
export default projectSlice.reducer;