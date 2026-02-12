import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  FolderIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false,
  isOpen = true,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const expandedWidth = 256;
  const collapsedWidth = 80;
  const sidebarWidth = isMobile ? expandedWidth : isCollapsed ? collapsedWidth : expandedWidth;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Squares2X2Icon },
    { name: 'Team', path: '/active-members', icon: UserGroupIcon },
    { name: 'Projects', path: '/projects', icon: FolderIcon },
    { name: 'Calendar', path: '/calendar', icon: CalendarDaysIcon },
    { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
    { name: 'Help', path: '/help', icon: QuestionMarkCircleIcon },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarWidth,
        x: isMobile ? (isOpen ? 0 : -expandedWidth - 32) : 0,
      }}
      whileHover={isMobile ? undefined : { width: expandedWidth }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={isMobile && !isOpen}
      className={`fixed left-0 top-0 h-screen z-50 group overflow-hidden ${
        isDarkMode
          ? 'bg-[#0B0E11] border-r border-white/5'
          : 'bg-[#E6E8E5] border-r border-[#0B0E11]/15'
      } ${isMobile && !isOpen ? 'pointer-events-none' : ''}`}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#17E1FF]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="p-6 h-full flex flex-col relative z-10">
        {/* Brand Header */}
        <div className="mb-12 flex items-center justify-between">
          <motion.div
            initial={false}
            animate={{
              opacity: isCollapsed ? 0 : 1,
              x: isCollapsed ? -20 : 0,
            }}
            className="group-hover:opacity-100 group-hover:x-0"
          >
            <h1
              className={`text-2xl font-black uppercase tracking-tighter ${
                isDarkMode ? 'text-[#E6E8E5]' : 'text-[#0B0E11]'
              }`}
            >
              CODEX
            </h1>
          </motion.div>
          {isMobile ? (
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${
                isDarkMode
                  ? 'text-[#E6E8E5]/60 hover:text-[#17E1FF] hover:bg-white/5'
                  : 'text-[#0B0E11]/80 hover:text-[#17E1FF] hover:bg-[#0B0E11]/15'
              }`}
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              className={`p-2 rounded-xl transition-all ${
                isDarkMode
                  ? 'text-[#E6E8E5]/60 hover:text-[#17E1FF] hover:bg-white/5'
                  : 'text-[#0B0E11]/80 hover:text-[#17E1FF] hover:bg-[#0B0E11]/15'
              }`}
              aria-label="Toggle sidebar"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
                <motion.span
                  animate={{ width: isCollapsed ? 20 : 16 }}
                  className={`h-0.5 transition-colors ${isDarkMode ? 'bg-current' : 'bg-current'}`}
                />
                <span className="h-0.5 w-5 bg-current" />
                <motion.span
                  animate={{ width: isCollapsed ? 20 : 16 }}
                  className="h-0.5 bg-current"
                />
              </div>
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group/item relative overflow-hidden
                  ${
                    isActive
                      ? isDarkMode
                        ? 'bg-[#17E1FF]/10 text-[#17E1FF] font-bold border border-[#17E1FF]/20'
                        : 'bg-[#0B0E11] text-[#E6E8E5] font-bold'
                      : isDarkMode
                        ? 'text-[#E6E8E5]/50 hover:bg-white/5 hover:text-[#E6E8E5]'
                        : 'text-[#0B0E11]/70 hover:bg-[#0B0E11]/15 hover:text-[#0B0E11]'
                  }
                `}
                title={item.name}
                onClick={handleNavClick}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#17E1FF]/0 via-[#17E1FF]/5 to-[#17E1FF]/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />

                <item.icon className="w-5 h-5 flex-shrink-0 relative z-10" />
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isCollapsed ? 0 : 1,
                    x: isCollapsed ? -10 : 0,
                  }}
                  className="text-sm relative z-10 whitespace-nowrap group-hover:opacity-100 group-hover:x-0"
                >
                  {item.name}
                </motion.span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Bottom Section */}
        <motion.div
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
          }}
          className="space-y-2 mb-6 group-hover:opacity-100 transition-opacity"
        >
          <div className={`h-px my-6 ${isDarkMode ? 'bg-white/5' : 'bg-[#0B0E11]/10'}`} />

          {/* Settings & Help */}
          {bottomItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm
                ${
                  isActive
                    ? isDarkMode
                      ? 'bg-[#17E1FF]/10 text-[#17E1FF] font-bold'
                      : 'bg-[#0B0E11] text-[#E6E8E5] font-bold'
                    : isDarkMode
                      ? 'text-[#E6E8E5]/50 hover:bg-white/5 hover:text-[#E6E8E5]'
                      : 'text-[#0B0E11]/70 hover:bg-[#0B0E11]/15 hover:text-[#0B0E11]'
                }
              `}
              onClick={handleNavClick}
            >
              <item.icon className="w-5 h-5" />
              <span className="whitespace-nowrap">{item.name}</span>
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all ${
              isDarkMode
                ? 'text-[#E6E8E5]/50 hover:bg-red-500/10 hover:text-red-400'
                : 'text-[#0B0E11]/70 hover:bg-red-500/10 hover:text-red-500'
            }`}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="whitespace-nowrap">Logout</span>
          </button>
        </motion.div>

        {/* CTA Card */}
        <motion.div
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
            y: isCollapsed ? 20 : 0,
          }}
          className="relative overflow-hidden rounded-3xl border p-6 backdrop-blur-sm group-hover:opacity-100 group-hover:y-0 transition-all duration-500"
          style={{
            borderColor: isDarkMode ? 'rgba(23, 225, 255, 0.1)' : 'rgba(11, 14, 17, 0.1)',
            backgroundColor: isDarkMode ? 'rgba(23, 225, 255, 0.05)' : 'rgba(11, 14, 17, 0.03)',
          }}
        >
          {/* Decorative Background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#17E1FF] blur-3xl opacity-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-[#17E1FF] blur-2xl opacity-5" />

          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#17E1FF]/20 flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-[#17E1FF]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4
              className={`font-black text-sm mb-1 uppercase tracking-tight ${
                isDarkMode ? 'text-[#E6E8E5]' : 'text-[#0B0E11]'
              }`}
            >
              Upgrade Pro
            </h4>
            <p
              className={`text-xs mb-4 leading-relaxed font-light ${
                isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/70'
              }`}
            >
              Unlock advanced features and unlimited projects.
            </p>
            <button className="w-full py-2.5 rounded-2xl bg-[#E6E8E5] text-[#0B0E11] text-sm font-black border uppercase tracking-wide hover:scale-[1.02] transition-transform shadow-lg">
              Upgrade Now
            </button>
          </div>
        </motion.div>

        {/* Collapsed State Indicator */}
        <motion.div
          initial={false}
          animate={{
            opacity: isCollapsed ? 1 : 0,
            scale: isCollapsed ? 1 : 0.8,
          }}
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 group-hover:opacity-0 transition-opacity ${
            isMobile ? 'hidden' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#17E1FF]/10 border border-[#17E1FF]/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#17E1FF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

