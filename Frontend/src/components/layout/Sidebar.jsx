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
  onHoverExpand,
  onHoverCollapse,
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

  const handleLogout = (redirectTo = '/login') => {
    dispatch(logout());
    navigate(redirectTo);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleHoverExpand = () => {
    if (!isMobile && onHoverExpand) {
      onHoverExpand();
    }
  };

  const handleHoverCollapse = () => {
    if (!isMobile && onHoverCollapse) {
      onHoverCollapse();
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

  const isCollapsedView = !isMobile && isCollapsed;
  const navLinkClass = isActive => {
    const base = 'group/item relative flex items-center rounded-full transition-all';
    const layout = isCollapsedView ? 'justify-center p-1' : 'gap-3 px-4 py-3.5';
    const state = isActive
      ? isDarkMode
        ? 'bg-[#17E1FF]/10 text-[#17E1FF] font-bold border border-[#17E1FF]/20'
        : 'bg-[#0B0E11] text-[#E6E8E5] font-bold  '
      : isDarkMode
        ? 'text-[#E6E8E5]/50 hover:bg-white/5 hover:text-[#E6E8E5]'
        : 'text-[#0B0E11]/70 hover:bg-[#0B0E11]/15 hover:text-[#0B0E11]';
    return `${base} ${layout} ${state}`;
  };

  const iconShellClass = isCollapsedView
    ? `flex items-center justify-center w-10 h-9.5 p-2 rounded-full border ${
        isDarkMode
          ? 'bg-white/5 border-white/10 group-hover/item:bg-white/10'
          : 'bg-white/90 border-[#0B0E11]/10 group-hover/item:bg-white'
      }`
    : 'flex items-center justify-center';

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarWidth,
        x: isMobile ? (isOpen ? 0 : -expandedWidth - 32) : 0,
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={handleHoverExpand}
      onMouseLeave={handleHoverCollapse}
      aria-hidden={isMobile && !isOpen}
      className={`fixed left-0 top-0 h-screen z-50 group overflow-hidden ${
        isDarkMode
          ? 'bg-[#0B0E11] border-r border-white/5'
          : 'bg-[#E6E8E5] border-r border-[#0B0E11]/15'
      } ${isMobile && !isOpen ? 'pointer-events-none' : ''}`}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#17E1FF]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div
        className={`h-full flex flex-col relative z-10 ${isCollapsedView ? 'px-4 py-4' : 'p-4'}`}
      >
        {/* Brand Header */}
        <div
          className={`mb-10 ${
            isCollapsedView
              ? 'flex flex-col items-center gap-4'
              : 'flex items-center justify-between'
          }`}
        >
          <motion.button
            initial={false}
            animate={{
              opacity: 1,
              x: 0,
              scale: isCollapsedView ? 0.95 : 1,
            }}
            onClick={() => handleLogout('/')}
            className={`flex items-center justify-center rounded-full transition-all ${
              isDarkMode
                ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                : 'bg-white/90 hover:bg-white border border-[#0B0E11]/15'
            } ${isCollapsedView ? 'w-12 h-12' : 'w-11 h-11'}`}
            aria-label="Logout and return to landing page"
          >
            <img src="/logo.png" alt="CodeX logo" className="w-11 h-11  rounded-full object-contain" />
          </motion.button>
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
            <div className="w-10" />
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) => navLinkClass(isActive)}
                title={isCollapsedView ? item.name : undefined}
                onClick={handleNavClick}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#17E1FF]/0 via-[#17E1FF]/5 to-[#17E1FF]/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />

                <span
                  className={`relative z-10 flex items-center ${
                    isCollapsedView ? 'justify-center w-full' : 'gap-3'
                  }`}
                >
                  <span className={iconShellClass}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                  </span>
                  {isCollapsedView ? (
                    <span className="sr-only">{item.name}</span>
                  ) : (
                    <span className="text-sm relative z-10 whitespace-nowrap">{item.name}</span>
                  )}
                </span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Bottom Section */}
        <motion.div initial={false} animate={{ opacity: 1 }} className="space-y-2 mb-6">
          <div className={`h-px my-6 ${isDarkMode ? 'bg-white/5' : 'bg-[#0B0E11]/10'}`} />

          {/* Settings & Help */}
          {bottomItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => navLinkClass(isActive)}
              title={isCollapsedView ? item.name : undefined}
              onClick={handleNavClick}
            >
              <span
                className={`relative z-10 flex items-center ${
                  isCollapsedView ? 'justify-center w-full' : 'gap-3'
                }`}
              >
                <span className={iconShellClass}>
                  <item.icon className="w-5 h-5" />
                </span>
                {isCollapsedView ? (
                  <span className="sr-only">{item.name}</span>
                ) : (
                  <span className="text-sm whitespace-nowrap">{item.name}</span>
                )}
              </span>
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={() => handleLogout('/login')}
            className={`group/item relative w-full flex items-center rounded-2xl transition-all ${
              isCollapsedView ? 'justify-center p-2' : 'gap-3 px-4 py-3.5'
            } ${
              isDarkMode
                ? 'text-[#E6E8E5]/50 hover:bg-red-500/10 hover:text-red-400'
                : 'text-[#0B0E11]/70 hover:bg-red-500/10 hover:text-red-500'
            }`}
            title={isCollapsedView ? 'Logout' : undefined}
          >
            <span
              className={`relative z-10 flex items-center ${
                isCollapsedView ? 'justify-center w-full' : 'gap-3'
              }`}
            >
              <span className={iconShellClass}>
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </span>
              {isCollapsedView ? (
                <span className="sr-only">Logout</span>
              ) : (
                <span className="whitespace-nowrap text-sm">Logout</span>
              )}
            </span>
          </button>
        </motion.div>

        {/* CTA Card */}
        {!isCollapsedView && (
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border p-6 backdrop-blur-sm transition-all duration-500"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
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
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
