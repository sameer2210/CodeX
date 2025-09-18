import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Code2,
  FolderPlus,
  Home,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useState , useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

const Navigation = ({ showUserActions = true }) => {
  const { isDarkMode } = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get user data from localStorage
  const teamName = localStorage.getItem('codex_team');
  const username = localStorage.getItem('codex_username');
  const isAuthenticated = !!(localStorage.getItem('codex_token') && teamName && username);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
      if (!event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('codex_token');
    localStorage.removeItem('codex_team');
    localStorage.removeItem('codex_username');
    navigate('/');
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navigationItems = isAuthenticated
    ? [
        { label: 'Dashboard', path: '/dashboard', icon: Home },
        { label: 'Projects', path: '/projects', icon: FolderPlus },
        { label: 'New Project', path: '/create-project', icon: FolderPlus },
        { label: 'Settings', path: '/settings', icon: Settings },
      ]
    : [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Sign In', path: '/login', icon: User },
        { label: 'Sign Up', path: '/register', icon: FolderPlus },
      ];

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        type: 'spring',
        stiffness: 100,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <>
      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-500 ${
          isDarkMode
            ? 'bg-slate-950/90 border-b border-slate-800/50'
            : 'bg-white/90 border-b border-slate-200/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Brand */}
            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <motion.div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600'
                      : 'bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500'
                  }`}
                  whileHover={{ rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Code2 className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                </motion.div>
                {/* Animated glow effect */}
                <div
                  className={`absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600'
                      : 'bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500'
                  }`}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
                  CodeX
                </h1>
                {isAuthenticated && teamName && (
                  <p
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Team: {teamName}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.slice(0, 3).map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.button
                    key={item.path}
                    variants={itemVariants}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      isActive
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                        : isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:shadow-lg'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme Toggle */}
              <motion.button
                variants={itemVariants}
                onClick={handleThemeToggle}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-amber-400 shadow-lg'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-amber-600 shadow-md'
                }`}
                whileHover={{ scale: 1.05, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform" />
                )}
              </motion.button>

              {/* User Actions - Desktop */}
              {showUserActions && isAuthenticated && (
                <div className="hidden sm:block relative user-dropdown">
                  <motion.button
                    variants={itemVariants}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center space-x-3 p-2.5 rounded-xl transition-all duration-300 group ${
                      isDarkMode
                        ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 shadow-lg'
                        : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 shadow-md border border-slate-200/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">
                        {username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <span className="text-sm font-semibold block">{username}</span>
                      <span
                        className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                      >
                        {teamName}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl border backdrop-blur-xl ${
                          isDarkMode
                            ? 'bg-slate-900/95 border-slate-700/50'
                            : 'bg-white/95 border-slate-200/50'
                        }`}
                      >
                        <div className="p-3">
                          <div
                            className={`px-3 py-2 text-sm rounded-xl mb-2 ${
                              isDarkMode
                                ? 'bg-slate-800/50 text-slate-300'
                                : 'bg-slate-100/50 text-slate-600'
                            }`}
                          >
                            Signed in as{' '}
                            <span className="font-semibold text-blue-500">{username}</span>
                          </div>

                          <button
                            onClick={() => {
                              navigate('/settings');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                              isDarkMode
                                ? 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                            }`}
                          >
                            <Settings className="w-4 h-4" />
                            <span className="font-medium">Settings</span>
                          </button>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200 font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                variants={itemVariants}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 mobile-menu ${
                  isDarkMode
                    ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 shadow-md'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`fixed top-16 sm:top-20 right-0 w-80 max-w-[90vw] h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] z-50 mobile-menu ${
                isDarkMode
                  ? 'bg-slate-950/95 border-l border-slate-800/50'
                  : 'bg-white/95 border-l border-slate-200/50'
              } backdrop-blur-xl`}
            >
              <div className="p-6 h-full flex flex-col">
                {/* Navigation Items */}
                <nav className="flex-1">
                  <div className="space-y-3">
                    {navigationItems.map((item, index) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <motion.button
                          key={item.path}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center space-x-3 w-full px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                            isActive
                              ? isDarkMode
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                              : isDarkMode
                                ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </nav>

                {/* User Section */}
                {isAuthenticated && (
                  <div
                    className={`mt-6 p-4 rounded-2xl border ${
                      isDarkMode
                        ? 'bg-slate-800/50 border-slate-700/50'
                        : 'bg-slate-100/50 border-slate-200/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">
                          {username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                        >
                          {username}
                        </p>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
                        >
                          Team: {teamName}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm font-medium rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
