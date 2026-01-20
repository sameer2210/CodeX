import {
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  HomeIcon,
  MinusIcon,
  PlusCircleIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsExpanded(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Projects', path: '/projects', icon: FolderIcon },
    { name: 'Create Project', path: '/create-project', icon: PlusCircleIcon },
    { name: 'Team', path: '/team', icon: UserGroupIcon },
    { name: 'Activity', path: '/activity', icon: ChartBarIcon },
    { name: 'Settings', path: '/settings', icon: CogIcon },
    { name: 'Help', path: '/help', icon: QuestionMarkCircleIcon },
  ];

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  if (isMobile) {
    return (
      <>
        <button
          className={`fixed top-16 left-4 z-50 p-2 rounded-md transition-colors lg:hidden ${
            isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <MinusIcon className="h-6 w-6" />
        </button>

        <motion.aside
          initial="closed"
          animate={isExpanded ? 'open' : 'closed'}
          variants={sidebarVariants}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`fixed top-0 left-0 h-full w-64 z-50 border-r transition-colors duration-300 overflow-y-auto ${
            isDarkMode ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span
                  className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  CodexAI
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsExpanded(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? isDarkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-600'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3 font-medium">{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {localStorage.getItem('codex_username')?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {localStorage.getItem('codex_username') || 'User'}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {localStorage.getItem('codex_team') || 'Team'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  handleLogout();
                  setIsExpanded(false);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-red-600/20 hover:text-red-400'
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span className="ml-3 font-medium">Logout</span>
              </button>
            </div>
          </div>
        </motion.aside>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </>
    );
  }

  // Desktop version
  return (
    <motion.aside
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 h-full z-30 border-r transition-colors duration-300 hidden lg:block ${
        isDarkMode ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/10">
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                CodexAI
              </span>
            </motion.div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">C</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg transition-colors group relative ${
                  isActive
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${!isExpanded ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded ? (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="ml-3 font-medium"
                >
                  {item.name}
                </motion.span>
              ) : (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200/10">
          <div className={`flex items-center mb-4 ${!isExpanded ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {localStorage.getItem('codex_username')?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex-1"
              >
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {localStorage.getItem('codex_username') || 'User'}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {localStorage.getItem('codex_team') || 'Team'}
                </p>
              </motion.div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors group relative ${
              isDarkMode
                ? 'text-gray-300 hover:bg-red-600/20 hover:text-red-400'
                : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
            } ${!isExpanded ? 'justify-center' : ''}`}
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {isExpanded ? (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="ml-3 font-medium"
              >
                Logout
              </motion.span>
            ) : (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
