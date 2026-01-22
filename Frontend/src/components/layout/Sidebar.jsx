import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  FolderIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Squares2X2Icon },
    { name: 'Projects', path: '/projects', icon: FolderIcon },
    { name: 'Calendar', path: '/calendar', icon: CalendarDaysIcon },
    { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
    { name: 'Team', path: '/team', icon: UserGroupIcon },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
    { name: 'Help', path: '/help', icon: QuestionMarkCircleIcon },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen transition-all duration-500 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isDarkMode ? 'bg-[#1a1c19]' : 'bg-[#10120F]'}`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Brand Header */}
        <div className="mb-12 flex items-center justify-between">
          {!isCollapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-[#C2CABB] tracking-tight"
            >
              STUDIO
            </motion.h1>
          )}
          <button
            onClick={onToggleCollapse}
            className="text-[#C2CABB] hover:text-white transition-colors p-1"
            aria-label="Toggle sidebar"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
              <span
                className={`h-0.5 bg-current transition-all ${isCollapsed ? 'w-6' : 'w-4'}`}
              ></span>
              <span className="h-0.5 w-6 bg-current"></span>
              <span
                className={`h-0.5 bg-current transition-all ${isCollapsed ? 'w-6' : 'w-4'}`}
              ></span>
            </div>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative overflow-hidden
                  ${
                    isActive
                      ? 'bg-[#C2CABB]/20 text-[#C2CABB] font-bold'
                      : 'text-[#C2CABB]/60 hover:bg-[#C2CABB]/10 hover:text-[#C2CABB]'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.name}</span>}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="space-y-2 mb-6">
            <div className="h-px bg-[#C2CABB]/10 my-6"></div>

            {/* Settings & Help */}
            {bottomItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm
                  ${
                    isActive
                      ? 'bg-[#C2CABB]/20 text-[#C2CABB] font-bold'
                      : 'text-[#C2CABB]/60 hover:bg-[#C2CABB]/10 hover:text-[#C2CABB]'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-[#C2CABB]/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* CTA Card - Only show when not collapsed */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-[#C2CABB]/10 p-6 border border-[#C2CABB]/20 backdrop-blur-sm"
          >
            {/* Decorative Background */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#C2CABB] blur-3xl opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-[#C2CABB] blur-2xl opacity-5"></div>

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#C2CABB]/20 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-[#C2CABB]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-sm mb-1 text-[#C2CABB]">Upgrade to Pro</h4>
              <p className="text-xs text-[#C2CABB]/60 mb-4 leading-relaxed">
                Unlock advanced features and unlimited projects.
              </p>
              <button className="w-full py-2.5 rounded-2xl bg-[#C2CABB] text-[#10120F] text-sm font-bold hover:scale-[1.02] transition-transform shadow-lg">
                Upgrade Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Collapsed State Icon */}
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="w-10 h-10 rounded-full bg-[#C2CABB]/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#C2CABB]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </motion.div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
