import axios from 'axios';
import { motion } from 'framer-motion';
import { Code2, Grid, List, Moon, Plus, Search, Sparkles, Sun, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get('https://ai-jlvm.onrender.com/projects/get-all')
      .then(response => {
        setProjects(response.data.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setIsLoading(false);
      });
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getLanguageColor = language => {
    const colors = {
      JavaScript: 'from-yellow-400 to-orange-500',
      TypeScript: 'from-blue-400 to-blue-600',
      Python: 'from-green-400 to-blue-500',
      'Node.js': 'from-green-500 to-green-700',
      React: 'from-cyan-400 to-blue-500',
    };
    return colors[language] || 'from-gray-400 to-gray-600';
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-900/80 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100'
      }`}
    >
      {/* Header */}
      <header
        className={`relative backdrop-blur-md border-b transition-all duration-300 ${
          isDarkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Code2 className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent`}
                >
                  CodeX
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-Powered Development
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* View Toggle */}
              <div
                className={`hidden sm:flex p-1 rounded-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600 shadow-md'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Create Project Button */}
              <button
                onClick={() => navigate('/create-project')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span
              className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              AI-Powered Development Platform
            </span>
          </div>
          <h2
            className={`text-4xl md:text-6xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Welcome back to{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
              CodeX
            </span>
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Build, collaborate, and deploy with the power of AI
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-8">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {projects.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Projects
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Powered
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                24/7
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Available
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Projects Section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading your projects...
              </p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <Code2 className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3
              className={`text-2xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm
                ? `No projects match "${searchTerm}". Try a different search term.`
                : 'Start by creating your first AI-powered project!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/create-project')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Project</span>
              </button>
            )}
          </div>
        ) : (
          <motion.div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
                className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  viewMode === 'list' ? 'hover:scale-[1.02]' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div
                  className={`relative p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 group-hover:border-blue-500/50 ${
                    isDarkMode
                      ? 'bg-gray-800/40 border-gray-700/50'
                      : 'bg-white/60 border-gray-200/50'
                  } ${viewMode === 'list' ? 'flex items-center space-x-6' : ''}`}
                >
                  {/* Project Icon */}
                  <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${getLanguageColor(project.language)} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      <Code2 className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3
                      className={`text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {project.name}
                    </h3>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Created on {formatDate(project.createdAt)}
                    </p>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click to view or edit this project
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        AI Enabled
                      </span>
                      {viewMode === 'grid' && (
                        <div
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          <span className="text-sm">Click to open →</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {viewMode === 'list' && (
                    <div
                      className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <span className="text-sm">Open →</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Home;
