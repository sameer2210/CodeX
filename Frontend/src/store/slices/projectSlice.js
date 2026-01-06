import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/config';

/* ========== ASYNC THUNKS ========== */

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

export const fetchProject = createAsyncThunk(
  'projects/fetchOne',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects/create', projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

/* ========== SLICE ========== */

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    // Projects list
    projects: [],

    // Current project
    currentProject: null,

    // Project-specific data (keyed by projectId)
    projectData: {
      // [projectId]: {
      //   messages: [],
      //   activeUsers: [],
      //   typingUsers: [],
      //   code: '',
      //   review: '',
      //   language: 'javascript',
      //   isJoined: false,
      // }
    },

    // Stats
    stats: {
      totalProjects: 0,
      activeProjects: 0,
      teamMembers: 1,
      completedTasks: 0,
    },

    // UI state
    isLoading: false,
    error: null,
  },
  reducers: {
    /* ===== PROJECT MANAGEMENT ===== */

    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
      const projectId = action.payload?._id;

      // Initialize project data if not exists
      if (projectId && !state.projectData[projectId]) {
        state.projectData[projectId] = {
          messages: [],
          activeUsers: [],
          typingUsers: [],
          code: action.payload?.code || '',
          review: action.payload?.review || '',
          language: action.payload?.language || 'javascript',
          isJoined: false,
        };
      }
    },

    setProjectJoined: (state, action) => {
      const { projectId, joined } = action.payload;
      if (state.projectData[projectId]) {
        state.projectData[projectId].isJoined = joined;
      }
    },

    /* ===== CHAT MANAGEMENT ===== */

    setChatMessages: (state, action) => {
      const { projectId, messages } = action.payload;

      if (!state.projectData[projectId]) {
        state.projectData[projectId] = {
          messages: [],
          activeUsers: [],
          typingUsers: [],
          code: '',
          review: '',
          language: 'javascript',
          isJoined: false,
        };
      }

      state.projectData[projectId].messages = messages;
    },

    addChatMessage: (state, action) => {
      const { projectId, message } = action.payload;

      if (!state.projectData[projectId]) {
        state.projectData[projectId] = {
          messages: [],
          activeUsers: [],
          typingUsers: [],
          code: '',
          review: '',
          language: 'javascript',
          isJoined: false,
        };
      }

      // Check for duplicate messages
      const exists = state.projectData[projectId].messages.some(msg => msg._id === message._id);

      if (!exists) {
        state.projectData[projectId].messages.push(message);
      }
    },

    clearChatMessages: (state, action) => {
      const { projectId } = action.payload;
      if (state.projectData[projectId]) {
        state.projectData[projectId].messages = [];
      }
    },

    /* ===== USER PRESENCE ===== */

    setActiveUsers: (state, action) => {
      const { projectId, users } = action.payload;

      if (!state.projectData[projectId]) {
        state.projectData[projectId] = {
          messages: [],
          activeUsers: [],
          typingUsers: [],
          code: '',
          review: '',
          language: 'javascript',
          isJoined: false,
        };
      }

      state.projectData[projectId].activeUsers = users;
    },

    addTypingUser: (state, action) => {
      const { projectId, username } = action.payload;

      if (state.projectData[projectId]) {
        if (!state.projectData[projectId].typingUsers.includes(username)) {
          state.projectData[projectId].typingUsers.push(username);
        }
      }
    },

    removeTypingUser: (state, action) => {
      const { projectId, username } = action.payload;

      if (state.projectData[projectId]) {
        state.projectData[projectId].typingUsers = state.projectData[projectId].typingUsers.filter(
          user => user !== username
        );
      }
    },

    /* ===== CODE MANAGEMENT ===== */

    updateProjectCode: (state, action) => {
      const { projectId, code } = action.payload;

      if (state.projectData[projectId]) {
        state.projectData[projectId].code = code;
      }

      // Also update current project if it matches
      if (state.currentProject?._id === projectId) {
        state.currentProject.code = code;
      }
    },

    updateProjectReview: (state, action) => {
      const { projectId, review } = action.payload;

      if (state.projectData[projectId]) {
        state.projectData[projectId].review = review;
      }

      // Also update current project if it matches
      if (state.currentProject?._id === projectId) {
        state.currentProject.review = review;
      }
    },

    setLanguage: (state, action) => {
      const { projectId, language } = action.payload;

      if (state.projectData[projectId]) {
        state.projectData[projectId].language = language;
      }
    },

    /* ===== UTILITY ===== */

    clearError: state => {
      state.error = null;
    },

    clearProjectData: (state, action) => {
      const { projectId } = action.payload;
      if (state.projectData[projectId]) {
        delete state.projectData[projectId];
      }
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, state => {
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

      // Fetch Single Project
      .addCase(fetchProject.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;

        const projectId = action.payload._id;
        if (!state.projectData[projectId]) {
          state.projectData[projectId] = {
            messages: [],
            activeUsers: [],
            typingUsers: [],
            code: action.payload.code || '',
            review: action.payload.review || '',
            language: action.payload.language || 'javascript',
            isJoined: false,
          };
        }
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Project
      .addCase(createProject.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.push(action.payload);
        state.stats.totalProjects += 1;
        state.stats.activeProjects += 1;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Project
      .addCase(updateProject.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedProject = action.payload;
        const index = state.projects.findIndex(p => p._id === updatedProject._id);

        if (index !== -1) {
          state.projects[index] = updatedProject;
        }

        if (state.currentProject?._id === updatedProject._id) {
          state.currentProject = updatedProject;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

/* ========== SELECTORS ========== */

export const selectCurrentProjectMessages = state => {
  const projectId = state.projects.currentProject?._id;
  return projectId ? state.projects.projectData[projectId]?.messages || [] : [];
};

export const selectCurrentProjectActiveUsers = state => {
  const projectId = state.projects.currentProject?._id;
  return projectId ? state.projects.projectData[projectId]?.activeUsers || [] : [];
};

export const selectCurrentProjectTypingUsers = state => {
  const projectId = state.projects.currentProject?._id;
  return projectId ? state.projects.projectData[projectId]?.typingUsers || [] : [];
};

export const selectCurrentProjectCode = state => {
  const projectId = state.projects.currentProject?._id;
  return projectId ? state.projects.projectData[projectId]?.code || '' : '';
};

export const selectCurrentProjectReview = state => {
  const projectId = state.projects.currentProject?._id;
  return projectId ? state.projects.projectData[projectId]?.review || '' : '';
};

export const selectCurrentProjectLanguage = state => {
  const projectId = state.projects.currentProject?._id;
  return projectId ? state.projects.projectData[projectId]?.language || 'javascript' : 'javascript';
};

export const selectProjectById = projectId => state => {
  return state.projects.projects.find(p => p._id === projectId);
};

export const selectProjectDataById = projectId => state => {
  return state.projects.projectData[projectId];
};

/* ========== EXPORTS ========== */

export const {
  setCurrentProject,
  setProjectJoined,
  setChatMessages,
  addChatMessage,
  clearChatMessages,
  setActiveUsers,
  addTypingUser,
  removeTypingUser,
  updateProjectCode,
  updateProjectReview,
  setLanguage,
  clearError,
  clearProjectData,
} = projectSlice.actions;

export default projectSlice.reducer;
