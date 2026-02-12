import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/config';
import { dashboardService } from '../../services/dashboardService';

const buildDashboardStats = projects => {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const stats = {
    totalProjects: safeProjects.length,
    endedProjects: 0,
    runningProjects: 0,
    pendingProjects: 0,
    totalGrowth: 0,
    endedGrowth: 0,
    runningGrowth: 0,
  };

  safeProjects.forEach(project => {
    const status = (project?.status || project?.state || '').toString().toLowerCase();

    if (status === 'completed' || status === 'done' || status === 'ended') {
      stats.endedProjects += 1;
    } else if (status === 'pending' || status === 'queued' || status === 'on-hold') {
      stats.pendingProjects += 1;
    } else {
      stats.runningProjects += 1;
    }
  });

  return stats;
};

/* ========== ASYNC THUNKS ========== */

export const fetchDashboardData = createAsyncThunk(
  'projects/fetchDashboardData',
  async (_, { rejectWithValue, getState }) => {
    try {
      const teamName = getState().auth?.user?.teamName;
      // Parallel fetch for dashboard performance
      const [projects, team] = await Promise.all([
        api
          .get('/projects/get-all')
          .then(res => res.data.data || [])
          .catch(() => []),
        dashboardService.getTeamMembers(teamName),
      ]);

      const stats = buildDashboardStats(projects);

      return { stats, projects, team };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  },
  {
    condition: (_, { getState }) => {
      const { projects } = getState();
      if (projects.isLoading) return false;
      const now = Date.now();
      const lastFetch = projects.lastDashboardFetchAt;
      const lastError = projects.lastDashboardErrorAt;
      if (lastFetch && now - lastFetch < 15000) return false;
      if (lastError && now - lastError < 15000) return false;
      return true;
    },
  }
);

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

export const executeProjectCode = createAsyncThunk(
  'projects/executeCode',
  async ({ projectId, code, language }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/projects/${projectId}/execute`, { code, language });

      return {
        output: res.data.data.stdout,
        error: res.data.data.stderr,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Execution failed');
    }
  }
);

/* ========== SLICE ========== */

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    recentProjects: [],
    teamMembers: [],
    currentProject: null,
    projectData: {}, // Project-specific data (keyed by projectId)

    // Stats
    stats: {
      totalProjects: 0,
      endedProjects: 0,
      runningProjects: 0,
      pendingProjects: 0,
      totalGrowth: 0,
      endedGrowth: 0,
      runningGrowth: 0,
    },
    execution: {
      isExecuting: false,
      output: '',
      error: null,
    },

    // UI state
    isLoading: false,
    error: null,
    lastDashboardFetchAt: null,
    lastDashboardErrorAt: null,
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

    /* ===== TEAM STATUS ===== */

    updateTeamMemberStatus: (state, action) => {
      const { username, status, isActive } = action.payload || {};
      if (!username) return;

      const normalizedStatus = status || (isActive ? 'online' : 'offline');
      const normalizedIsActive = typeof isActive === 'boolean' ? isActive : normalizedStatus === 'online';

      const member = state.teamMembers.find(
        m => m.username?.toLowerCase() === username.toLowerCase()
      );

      if (member) {
        member.status = normalizedStatus;
        member.isActive = normalizedIsActive;
      } else {
        state.teamMembers.unshift({
          _id: `temp_${username}`,
          username,
          status: normalizedStatus,
          isActive: normalizedIsActive,
        });
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
      // Dashboard Data
      .addCase(fetchDashboardData.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.projects = action.payload.projects;
        state.teamMembers = action.payload.team;
        state.lastDashboardFetchAt = Date.now();
        state.lastDashboardErrorAt = null;

        // Calculate derived stats if API didn't provide specific fields
        if (state.stats.totalProjects === 0 && action.payload.projects.length > 0) {
          state.stats.totalProjects = action.payload.projects.length;
          state.stats.runningProjects = action.payload.projects.filter(
            p => p.status === 'active'
          ).length;
          state.stats.endedProjects = action.payload.projects.filter(
            p => p.status === 'completed'
          ).length;
          state.stats.pendingProjects = action.payload.projects.filter(
            p => p.status === 'pending'
          ).length;
        }
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.lastDashboardErrorAt = Date.now();
      })

      // Fetch Projects
      .addCase(fetchProjects.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
        // Update stats based on projects
        state.stats.totalProjects = action.payload.length;
        state.stats.runningProjects = action.payload.filter(p => p.status === 'active').length;
        state.stats.endedProjects = action.payload.filter(p => p.status === 'completed').length;
        state.stats.pendingProjects = action.payload.filter(p => p.status === 'pending').length;
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
        state.stats.runningProjects += 1;
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

        // Recalculate stats after update
        state.stats.totalProjects = state.projects.length;
        state.stats.runningProjects = state.projects.filter(p => p.status === 'active').length;
        state.stats.endedProjects = state.projects.filter(p => p.status === 'completed').length;
        state.stats.pendingProjects = state.projects.filter(p => p.status === 'pending').length;
      })

      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Execute Project Code
      .addCase(executeProjectCode.pending, state => {
        state.execution.isExecuting = true;
        state.execution.output = '';
        state.execution.error = null;
      })
      .addCase(executeProjectCode.fulfilled, (state, action) => {
        state.execution.isExecuting = false;
        state.execution.output = action.payload.output;
      })
      .addCase(executeProjectCode.rejected, (state, action) => {
        state.execution.isExecuting = false;
        state.execution.error = action.payload;
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

export const selectExecutionOutput = state => state.projects.execution.output;
export const selectExecutionError = state => state.projects.execution.error;
export const selectIsExecuting = state => state.projects.execution.isExecuting;

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
  updateTeamMemberStatus,
  clearError,
  clearProjectData,
} = projectSlice.actions;

export default projectSlice.reducer;
