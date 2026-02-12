import {
  Bars3Icon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Sidebar from '../layout/Sidebar';
import { useTheme } from '../../context/ThemeContext';
import ActiveMember from './ActiveMember';

const EASE = [0.22, 1, 0.36, 1];

const ActiveMemberPage = () => {
  const { isDarkMode } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(
    window.matchMedia('(min-width: 1024px)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const listener = () => setIsLargeScreen(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, []);

  useEffect(() => {
    if (isLargeScreen && isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [isLargeScreen, isMobileSidebarOpen]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const openMobileSidebar = () => setIsMobileSidebarOpen(true);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 relative ${
        isDarkMode ? 'bg-[#0B0E11] text-[#E6E8E5]' : 'bg-[#E6E8E5] text-[#0B0E11]'
      }`}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />
      <div
        className={`fixed inset-0 pointer-events-none opacity-[0.02] z-[1] ${
          isDarkMode ? 'opacity-[0.02]' : 'opacity-[0.01]'
        }`}
        style={{
          backgroundImage: isDarkMode
            ? 'linear-gradient(#E6E8E5 1px, transparent 1px), linear-gradient(90deg, #E6E8E5 1px, transparent 1px)'
            : 'linear-gradient(#0B0E11 1px, transparent 1px), linear-gradient(90deg, #0B0E11 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#17E1FF]/10 rounded-full blur-[200px] opacity-30 pointer-events-none z-[1]" />

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          isMobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          onClick={closeMobileSidebar}
          className={`absolute inset-0 z-40 transition-opacity backdrop-blur-sm ${
            isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'
          } ${isDarkMode ? 'bg-[#0B0E11]/60' : 'bg-[#0B0E11]/40'}`}
        />
        <Sidebar
          isCollapsed={false}
          isMobile
          isOpen={isMobileSidebarOpen}
          onClose={closeMobileSidebar}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
      </div>

      <motion.main
        animate={{
          marginLeft: isLargeScreen ? (isSidebarCollapsed ? 80 : 256) : 0,
        }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative z-10 p-4 sm:p-6 lg:p-12 min-h-screen flex flex-col"
      >
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={openMobileSidebar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`lg:hidden p-3 rounded-2xl transition-all backdrop-blur-xl border ${
                isDarkMode
                  ? 'hover:bg-white/5 border-white/5'
                  : 'hover:bg-white/95 border-[#0B0E11]/15'
              }`}
              aria-label="Open sidebar"
            >
              <Bars3Icon className="w-6 h-6" />
            </motion.button>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#17E1FF]">Team</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
                <UsersIcon className="w-7 h-7 text-[#17E1FF]" />
                Active Members
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/70'
                }`}
              >
                Live presence for everyone in your workspace.
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0">
          <ActiveMember title="Active Team" className="h-full" />
        </div>
      </motion.main>
    </div>
  );
};

export default ActiveMemberPage;
