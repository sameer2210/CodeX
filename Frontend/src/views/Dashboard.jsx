import { motion } from 'framer-motion';
import {
  Activity,
  Clock,
  Code2,
  Folder,
  GitBranch,
  Plus,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import Navigation from '../components/layout/Navigation';
import Sidebar from '../components/layout/Sidebar';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    teamMembers: 1,
    completedTasks: 0,
  });

  const teamName = localStorage.getItem('codex_team') || 'Your Team';
  const username = localStorage.getItem('codex_username') || 'User';

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setIsLargeScreen(mediaQuery.matches);

    const handleMediaChange = event => {
      setIsLargeScreen(event.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/get-all');
      const projectData = response.data.data || [];
      setProjects(projectData);
      setStats({
        totalProjects: projectData.length,
        activeProjects: projectData.filter(p => p.status !== 'completed').length,
        teamMembers: 1,
        completedTasks: projectData.filter(p => p.status === 'completed').length,
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Set empty array on error to prevent crashes
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getLanguageColor = language => {
    const colors = {
      JavaScript: 'from-yellow-400 to-orange-500',
      TypeScript: 'from-blue-400 to-blue-600',
      Python: 'from-green-400 to-blue-500',
      'Node.js': 'from-green-500 to-green-700',
      React: 'from-cyan-400 to-blue-500',
      HTML: 'from-orange-400 to-red-500',
      CSS: 'from-purple-400 to-pink-500',
      Java: 'from-red-500 to-orange-600',
      'C++': 'from-blue-600 to-purple-600',
      PHP: 'from-indigo-400 to-purple-500',
    };
    return colors[language] || 'from-gray-400 to-gray-600';
  };

  const recentActivities = [
    { action: 'Created new project', project: 'AI Chat App', time: '2 hours ago', icon: Plus },
    { action: 'Updated code', project: 'Web Dashboard', time: '4 hours ago', icon: Code2 },
    {
      action: 'Deployed to production',
      project: 'API Service',
      time: '1 day ago',
      icon: GitBranch,
    },
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-900/80 to-gray-900'
          : 'bg-gradient-to-br from-gray-100 via-stone-400 to-gray-200'
      }`}
    >
      <Navigation isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block transition-all duration-300 ${
          isSidebarCollapsed ? 'w-4' : 'w-4'
        } fixed inset-y-0 left-0 z-40 overflow-y-auto`}
      >
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
      </div>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isLargeScreen ? (isSidebarCollapsed ? 'ml-8' : 'ml-18') : 'ml-0'
        } pt-4 lg:pt-0`}
      >
        <div className="p-6">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 ml-4 flex items-start justify-between"
          >
            <div>
              <h1
                className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
                  {username}
                </span>
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Here's what's happening with your team <strong>{teamName}</strong> today
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: 'Total Projects',
                value: stats.totalProjects,
                icon: Folder,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                label: 'Active Projects',
                value: stats.activeProjects,
                icon: Activity,
                color: 'from-emerald-500 to-green-500',
              },
              {
                label: 'Team Members',
                value: stats.teamMembers,
                icon: Users,
                color: 'from-purple-500 to-pink-500',
              },
              {
                label: 'Completed Tasks',
                value: stats.completedTasks,
                icon: TrendingUp,
                color: 'from-orange-500 to-red-500',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600/50'
                    : 'bg-white/60 border-gray-200/50 hover:border-gray-300/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {stat.value}
                  </div>
                </div>
                <p
                  className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Projects */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`p-6 rounded-2xl backdrop-blur-sm border ${
                  isDarkMode
                    ? 'bg-gray-800/40 border-gray-700/50'
                    : 'bg-white/60 border-gray-200/50'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    Recent Projects
                  </h2>
                  <motion.button
                    onClick={() => navigate('/create-project')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </motion.button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <Code2
                        className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                      />
                    </div>
                    <h3
                      className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      No projects yet
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Create your first AI-powered project to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project, index) => (
                      <motion.div
                        key={project._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        onClick={() => navigate(`/project/${project._id}`)}
                        className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                          isDarkMode
                            ? 'hover:bg-gray-600 border border-transparent hover:border-gray-600/50'
                            : 'hover:bg-gray-300 border border-transparent hover:border-gray-300/50'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 bg-gradient-to-r
                            ${getLanguageColor(project.language || 'Unknown')} rounded-lg flex items-center justify-center shadow-md`}
                        >
                          <Code2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {project.name || 'Untitled Project'}
                          </h3>
                          <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            Created {formatDate(project.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isDarkMode
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            AI
                          </span>
                          <div
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            →
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`p-6 rounded-2xl backdrop-blur-sm border ${
                  isDarkMode
                    ? 'bg-gray-800/40 border-gray-700/50'
                    : 'bg-white/60 border-gray-200/50'
                }`}
              >
                <h2
                  className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                          {activity.action}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {activity.project}
                        </p>
                        <p
                          className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center mt-1`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={`mt-6 p-6 rounded-2xl backdrop-blur-sm border ${
                  isDarkMode
                    ? 'bg-gray-800/40 border-gray-700/50'
                    : 'bg-white/60 border-gray-200/50'
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Create Project',
                      path: '/create-project',
                      icon: Plus,
                      color: 'from-blue-500 to-purple-600',
                    },
                    {
                      label: 'View All Projects',
                      path: '/projects',
                      icon: Folder,
                      color: 'from-emerald-500 to-blue-500',
                    },
                    {
                      label: 'Team Settings',
                      path: '/team',
                      icon: Users,
                      color: 'from-orange-500 to-red-500',
                    },
                  ].map(action => (
                    <motion.button
                      key={action.path}
                      onClick={() => navigate(action.path)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        isDarkMode
                          ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                          : 'hover:bg-gray-100/50 text-gray-600 hover:text-gray-900'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center`}
                      >
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
