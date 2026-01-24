import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import {
  ChevronRight,
  FolderPlus,
  Home,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Terminal,
  User,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  const userMenuRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();

  // Authentication check
  const teamName = localStorage.getItem('codex_team');
  const username = localStorage.getItem('codex_username');
  const isAuthenticated = !!(localStorage.getItem('codex_token') && teamName && username);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  useMotionValueEvent(scrollY, 'change', latest => {
    setIsScrolled(latest > 20);
  });

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (!userMenuRef.current) return;
      if (!(event.target instanceof Node)) return;

      if (!userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
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
    setIsUserMenuOpen(false);
  };

  const navItems = isAuthenticated
    ? [
        { label: 'Dashboard', path: '/dashboard', icon: Home },
        { label: 'Projects', path: '/projects', icon: FolderPlus },
        { label: 'New Project', path: '/create-project', icon: Sparkles },
      ]
    : [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Sign In', path: '/login', icon: User },
      ];

  // Animation Variants
  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const menuItemVariants = {
    closed: { x: -20, opacity: 0 },
    open: i => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.1 + i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <>
      <motion.header
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 sm:px-8 py-4 ${
          isScrolled
            ? 'bg-[#10120F]/80 backdrop-blur-md border-b border-[#C2CABB]/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative w-10 h-10 flex items-center justify-center bg-[#C2CABB]/5 rounded-xl border border-[#C2CABB]/10 overflow-hidden group-hover:border-[#C2CABB]/30 transition-colors group-hover:shadow-[0_0_12px_rgba(194,202,187,0.2)]">
              <Terminal className="w-5 h-5 text-[#C2CABB] relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-lg tracking-tight text-white">CodeX</span>
              {isAuthenticated && teamName && (
                <span className="text-[10px] uppercase tracking-widest text-[#C2CABB]/60 font-medium">
                  {teamName}
                </span>
              )}
            </div>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center pl-18 gap-12">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative group py-2"
                  whileHover={{ y: -1 }}
                >
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-[#C2CABB] group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white"
                    />
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C2CABB]/40 transition-all duration-300 group-hover:w-full" />
                </motion.button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-[#C2CABB]/10 bg-[#C2CABB]/5 hover:bg-[#C2CABB]/10 transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xs font-medium text-[#C2CABB] group-hover:text-white transition-colors pl-1">
                    {username}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#10120F] border border-[#C2CABB]/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-4 w-56 p-2 rounded-2xl border border-[#C2CABB]/10 bg-[#10120F]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                    >
                      <div className="px-3 py-2 border-b border-[#C2CABB]/10 mb-2">
                        <p className="text-[10px] text-[#C2CABB]/50 uppercase tracking-wider font-semibold">
                          Signed in as
                        </p>
                        <p className="text-sm font-medium text-white truncate">{username}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => navigate('/settings')}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#C2CABB] hover:text-white hover:bg-white/5 transition-all w-full text-left"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={() => {
                  navigate('/register');
                  setIsMobileMenuOpen(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex group relative items-center justify-center px-3 py-2.5 overflow-hidden rounded-full border border-white/20 hover:border-[#17E1FF] transition-colors"
              >
                {/* Sliding background */}
                <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />

                {/* Text */}
                <span className="relative z-10 font-bold uppercase tracking-[0.2em] text-white group-hover:text-black transition-colors duration-300">
                  Get Started
                </span>

                {/* Icon */}
                <ChevronRight
                  size={18}
                  className="relative z-10 ml-2 text-white group-hover:text-black transition-colors"
                />
              </motion.button>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#C2CABB] hover:text-white"
              whileTap={{ scale: 0.9 }}
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#10120F] flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">CodeX</span>
              </div>
              <motion.button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <motion.nav
              className="flex-1 flex flex-col gap-6"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
            >
              {[
                ...navItems,
                ...(isAuthenticated
                  ? [{ label: 'Settings', path: '/settings', icon: Settings }]
                  : []),
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  variants={menuItemVariants}
                  className="group border-b border-[#C2CABB]/10 pb-4"
                >
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full"
                  >
                    <span className="text-3xl font-light text-[#C2CABB] group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                    <ChevronRight className="w-5 h-5 text-[#C2CABB]/30 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transform duration-300" />
                  </button>
                </motion.div>
              ))}
            </motion.nav>

            <div className="mt-auto">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-[#C2CABB] hover:text-red-400 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <motion.button
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative w-full h-14 flex items-center justify-center overflow-hidden rounded-full border border-white/20 hover:border-[#17E1FF] transition-colors"
                >
                  {/* Sliding background */}
                  <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />

                  {/* Text */}
                  <span className="relative z-10 font-bold uppercase tracking-[0.2em] text-white group-hover:text-black transition-colors duration-300">
                    Get Started
                  </span>

                  {/* Icon */}
                  <ChevronRight
                    size={18}
                    className="relative z-10 ml-2 text-white group-hover:text-black transition-colors"
                  />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
