import {
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  HomeIcon,
  PlusCircleIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: FolderIcon,
    },
    {
      name: 'Create Project',
      path: '/create-project',
      icon: PlusCircleIcon,
    },
    {
      name: 'Team',
      path: '/team',
      icon: UserGroupIcon,
    },
    {
      name: 'Activity',
      path: '/activity',
      icon: ChartBarIcon,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: CogIcon,
    },
    {
      name: 'Help',
      path: '/help',
      icon: QuestionMarkCircleIcon,
    },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 h-full z-20" onMouseEnter={() => setIsHovered(true)} />

      {/* Sidebar */}
      <motion.aside
        animate={{
          width: isHovered ? 280 : 80,
          x: 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 h-full z-30 border-r transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/10">
            {isHovered ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span
                  className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
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
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg transition-colors group relative ${
                      isActive
                        ? isDarkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${!isHovered ? 'justify-center' : ''}`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isHovered ? (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="ml-3 font-medium"
                    >
                      {item.name}
                    </motion.span>
                  ) : (
                    // Tooltip for collapsed state
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200/10">
            <div
              className={`flex items-center mb-4 ${!isHovered ? 'justify-center' : 'space-x-3'}`}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {localStorage.getItem('codex_username')?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
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
              } ${!isHovered ? 'justify-center' : ''}`}
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              {isHovered ? (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="ml-3 font-medium"
                >
                  Logout
                </motion.span>
              ) : (
                // Tooltip for logout button
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
