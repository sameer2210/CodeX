import api from '../api/config';

// Mock data generator for fallback/demo purposes
const generateMockStats = () => ({
  totalProjects: 24,
  endedProjects: 10,
  runningProjects: 12,
  pendingProjects: 2,
  totalGrowth: 5,
  endedGrowth: 6,
  runningGrowth: 2,
});

const generateMockTeam = () => [
  {
    _id: '1',
    username: 'Alexandra Deff',
    email: 'alex@donezo.com',
    role: 'Frontend Dev',
    status: 'online',
  },
  {
    _id: '2',
    username: 'Edwin Adenike',
    email: 'edwin@donezo.com',
    role: 'Product Owner',
    status: 'busy',
  },
  {
    _id: '3',
    username: 'Isaac Oluwatemilorun',
    email: 'isaac@donezo.com',
    role: 'Backend Dev',
    status: 'offline',
  },
  {
    _id: '4',
    username: 'David Oshodi',
    email: 'david@donezo.com',
    role: 'Designer',
    status: 'online',
  },
];

export const dashboardService = {
  // Fetch high-level statistics
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.warn('Failed to fetch stats, using mock data');
      return generateMockStats();
    }
  },

  // Fetch team members
  getTeamMembers: async () => {
    try {
      const response = await api.get('/team/members');
      return response.data.data;
    } catch (error) {
      console.warn('Failed to fetch team, using mock data');
      return generateMockTeam();
    }
  },

  // Fetch recent projects specifically for the dashboard list
  getRecentProjects: async () => {
    try {
      const response = await api.get('/projects/recent');
      return response.data.data;
    } catch (error) {
      console.warn('Failed to fetch recent projects');
      return [];
    }
  },
};
