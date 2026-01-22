import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  FolderIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({ isCollapsed }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

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
    { name: 'Dashboard', path: '/dashboard', icon: Squares2X2Icon },
    { name: 'Tasks', path: '/tasks', icon: FolderIcon, badge: '12+' },
    { name: 'Calendar', path: '/calendar', icon: CalendarDaysIcon },
    { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
    { name: 'Team', path: '/team', icon: UserGroupIcon },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
    { name: 'Help', path: '/help', icon: QuestionMarkCircleIcon },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#F8F9FA] border-r border-gray-100 flex flex-col z-30 font-sans">
      {/* Brand */}
      <div className="p-8 pb-4">
        <motion.div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative w-10 h-10 flex items-center justify-center bg-[#C2CABB]/5 rounded-xl border border-[#C2CABB]/10 overflow-hidden group-hover:border-[#C2CABB]/30 transition-colors group-hover:shadow-[0_0_12px_rgba(194,202,187,0.2)]">
            <CodeBracketIcon className="w-5 h-5 text-[#C2CABB] relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-lg tracking-tight text-white">CodeX</span>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        {/* Menu Section */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 mb-4 px-3 tracking-wider">MENU</p>
          <div className="space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-3 rounded-2xl transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-white text-[#144d36] shadow-sm font-semibold'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-[#10120F]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#144d36] text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* General Section */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 mb-4 px-3 tracking-wider">GENERAL</p>
          <div className="space-y-1">
            {bottomItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white text-[#144d36] shadow-sm font-semibold'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-[#10120F]'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* CTA Card */}
        <div className="mt-auto">
          <div className="relative overflow-hidden rounded-3xl bg-[#0d1f18] p-5 text-white shadow-xl shadow-[#144d36]/20">
            {/* Abstract Background Shapes */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#144d36] blur-2xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-emerald-500 blur-xl opacity-20"></div>

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-1">Download our Mobile App</h4>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Get easy access in another way. Sync across devices.
              </p>
              <button className="w-full py-2.5 rounded-xl bg-[#144d36] text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-black/20">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
