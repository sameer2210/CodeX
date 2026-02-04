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
      const teamName = localStorage.getItem('codex_team');
      if (!teamName) {
        console.warn('No team name found, skipping team members fetch');
        return [];
      }

      const response = await api.get(`/auth/team/${teamName}/members`);
      const members = response.data.members || response.data.data || [];

      return members.map(member => ({
        ...member,
        status: member.status || (member.isActive ? 'online' : 'offline'),
      }));
    } catch (error) {
      console.warn('Failed to fetch team, returning empty list');
      return [];
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
