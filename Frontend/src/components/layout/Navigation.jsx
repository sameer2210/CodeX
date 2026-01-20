// import { AnimatePresence, motion } from 'framer-motion';
// import {
//   ChevronDown,
//   Code2,
//   FolderPlus,
//   Home,
//   LogOut,
//   Menu,
//   Moon,
//   Settings,
//   Sun,
//   User,
//   X,
// } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { useAppDispatch } from '../../store/hooks';
// import { useTheme } from '../../context/ThemeContext';

// const Navigation = ({ showUserActions = true }) => {
//   const { isDarkMode } = useTheme();
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Get user data from localStorage
//   const teamName = localStorage.getItem('codex_team');
//   const username = localStorage.getItem('codex_username');
//   const isAuthenticated = !!(localStorage.getItem('codex_token') && teamName && username);

//   const handleThemeToggle = () => {
//     dispatch(useTheme());
//   };

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = event => {
//       if (!event.target.closest('.user-dropdown')) {
//         setIsDropdownOpen(false);
//       }
//       if (!event.target.closest('.mobile-menu')) {
//         setIsMobileMenuOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('codex_token');
//     localStorage.removeItem('codex_team');
//     localStorage.removeItem('codex_username');
//     navigate('/');
//     setIsDropdownOpen(false);
//     setIsMobileMenuOpen(false);
//   };

//   const navigationItems = isAuthenticated
//     ? [
//         { label: 'Dashboard', path: '/dashboard', icon: Home },
//         { label: 'Projects', path: '/projects', icon: FolderPlus },
//         { label: 'New Project', path: '/create-project', icon: FolderPlus },
//         { label: 'Settings', path: '/settings', icon: Settings },
//       ]
//     : [
//         { label: 'Home', path: '/', icon: Home },
//         { label: 'Sign In', path: '/login', icon: User },
//         { label: 'Sign Up', path: '/register', icon: FolderPlus },
//       ];

//   const containerVariants = {
//     hidden: { opacity: 0, y: -20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.6,
//         type: 'spring',
//         stiffness: 100,
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, x: -20 },
//     visible: { opacity: 1, x: 0 },
//   };

//   return (
//     <>
//       <motion.header
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-500 ${
//           isDarkMode
//             ? 'bg-slate-950/90 border-b border-slate-800/50'
//             : 'bg-white/90 border-b border-slate-200/50'
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16 sm:h-20">
//             {/* Logo and Brand */}
//             <motion.div
//               variants={itemVariants}
//               className="flex items-center space-x-3 cursor-pointer group"
//               onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               <div className="relative">
//                 <motion.div
//                   className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
//                     isDarkMode
//                       ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600'
//                       : 'bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500'
//                   }`}
//                   whileHover={{ rotate: 5 }}
//                   transition={{ type: 'spring', stiffness: 300 }}
//                 >
//                   <Code2 className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
//                 </motion.div>
//                 {/* Animated glow effect */}
//                 <div
//                   className={`absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 ${
//                     isDarkMode
//                       ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600'
//                       : 'bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500'
//                   }`}
//                 />
//               </div>
//               <div className="hidden sm:block">
//                 <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
//                   CodeX
//                 </h1>
//                 {isAuthenticated && teamName && (
//                   <p
//                     className={`text-xs font-medium ${
//                       isDarkMode ? 'text-slate-400' : 'text-slate-600'
//                     }`}
//                   >
//                     Team: {teamName}
//                   </p>
//                 )}
//               </div>
//             </motion.div>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center space-x-1">
//               {navigationItems.slice(0, 3).map(item => {
//                 const isActive = location.pathname === item.path;
//                 return (
//                   <motion.button
//                     key={item.path}
//                     variants={itemVariants}
//                     onClick={() => navigate(item.path)}
//                     className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
//                       isActive
//                         ? isDarkMode
//                           ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
//                           : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
//                         : isDarkMode
//                           ? 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:shadow-lg'
//                           : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 hover:shadow-md'
//                     }`}
//                     whileHover={{ scale: 1.02, y: -1 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <item.icon className="w-4 h-4" />
//                     <span>{item.label}</span>
//                   </motion.button>
//                 );
//               })}
//             </nav>

//             {/* Right Side Actions */}
//             <div className="flex items-center space-x-2 sm:space-x-3">
//               {/* Theme Toggle */}
//               <motion.button
//                 variants={itemVariants}
//                 onClick={handleThemeToggle}
//                 className={`p-2.5 rounded-xl transition-all duration-300 ${
//                   isDarkMode
//                     ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-amber-400 shadow-lg'
//                     : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-amber-600 shadow-md'
//                 }`}
//                 whileHover={{ scale: 1.05, rotate: 15 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 {isDarkMode ? (
//                   <Sun className="w-5 h-5 transition-transform" />
//                 ) : (
//                   <Moon className="w-5 h-5 transition-transform" />
//                 )}
//               </motion.button>

//               {/* User Actions - Desktop */}
//               {showUserActions && isAuthenticated && (
//                 <div className="hidden sm:block relative user-dropdown">
//                   <motion.button
//                     variants={itemVariants}
//                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     className={`flex items-center space-x-3 p-2.5 rounded-xl transition-all duration-300 group ${
//                       isDarkMode
//                         ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 shadow-lg'
//                         : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 shadow-md border border-slate-200/50'
//                     }`}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
//                       <span className="text-white text-sm font-bold">
//                         {username?.charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                     <div className="hidden md:block text-left">
//                       <span className="text-sm font-semibold block">{username}</span>
//                       <span
//                         className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
//                       >
//                         {teamName}
//                       </span>
//                     </div>
//                     <ChevronDown
//                       className={`w-4 h-4 transition-transform duration-300 ${
//                         isDropdownOpen ? 'rotate-180' : ''
//                       }`}
//                     />
//                   </motion.button>

//                   {/* Dropdown Menu */}
//                   <AnimatePresence>
//                     {isDropdownOpen && (
//                       <motion.div
//                         initial={{ opacity: 0, scale: 0.95, y: -10 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.95, y: -10 }}
//                         transition={{ duration: 0.2 }}
//                         className={`absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl border backdrop-blur-xl ${
//                           isDarkMode
//                             ? 'bg-slate-900/95 border-slate-700/50'
//                             : 'bg-white/95 border-slate-200/50'
//                         }`}
//                       >
//                         <div className="p-3">
//                           <div
//                             className={`px-3 py-2 text-sm rounded-xl mb-2 ${
//                               isDarkMode
//                                 ? 'bg-slate-800/50 text-slate-300'
//                                 : 'bg-slate-100/50 text-slate-600'
//                             }`}
//                           >
//                             Signed in as{' '}
//                             <span className="font-semibold text-blue-500">{username}</span>
//                           </div>

//                           <button
//                             onClick={() => {
//                               navigate('/settings');
//                               setIsDropdownOpen(false);
//                             }}
//                             className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
//                               isDarkMode
//                                 ? 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
//                                 : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
//                             }`}
//                           >
//                             <Settings className="w-4 h-4" />
//                             <span className="font-medium">Settings</span>
//                           </button>

//                           <button
//                             onClick={handleLogout}
//                             className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200 font-medium"
//                           >
//                             <LogOut className="w-4 h-4" />
//                             <span>Sign Out</span>
//                           </button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               )}

//               {/* Mobile Menu Button */}
//               <motion.button
//                 variants={itemVariants}
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 mobile-menu ${
//                   isDarkMode
//                     ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300'
//                     : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 shadow-md'
//                 }`}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       </motion.header>

//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
//               onClick={() => setIsMobileMenuOpen(false)}
//             />

//             {/* Mobile Menu Panel */}
//             <motion.div
//               initial={{ opacity: 0, x: '100%' }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: '100%' }}
//               transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//               className={`fixed top-16 sm:top-20 right-0 w-80 max-w-[90vw] h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] z-50 mobile-menu ${
//                 isDarkMode
//                   ? 'bg-slate-950/95 border-l border-slate-800/50'
//                   : 'bg-white/95 border-l border-slate-200/50'
//               } backdrop-blur-xl`}
//             >
//               <div className="p-6 h-full flex flex-col">
//                 {/* Navigation Items */}
//                 <nav className="flex-1">
//                   <div className="space-y-3">
//                     {navigationItems.map((item, index) => {
//                       const isActive = location.pathname === item.path;
//                       return (
//                         <motion.button
//                           key={item.path}
//                           initial={{ opacity: 0, x: 20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                           onClick={() => {
//                             navigate(item.path);
//                             setIsMobileMenuOpen(false);
//                           }}
//                           className={`flex items-center space-x-3 w-full px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
//                             isActive
//                               ? isDarkMode
//                                 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
//                                 : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
//                               : isDarkMode
//                                 ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
//                                 : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
//                           }`}
//                         >
//                           <item.icon className="w-5 h-5" />
//                           <span>{item.label}</span>
//                         </motion.button>
//                       );
//                     })}
//                   </div>
//                 </nav>

//                 {/* User Section */}
//                 {isAuthenticated && (
//                   <div
//                     className={`mt-6 p-4 rounded-2xl border ${
//                       isDarkMode
//                         ? 'bg-slate-800/50 border-slate-700/50'
//                         : 'bg-slate-100/50 border-slate-200/50'
//                     }`}
//                   >
//                     <div className="flex items-center space-x-3 mb-4">
//                       <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
//                         <span className="text-white font-bold">
//                           {username?.charAt(0).toUpperCase()}
//                         </span>
//                       </div>
//                       <div>
//                         <p
//                           className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
//                         >
//                           {username}
//                         </p>
//                         <p
//                           className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
//                         >
//                           Team: {teamName}
//                         </p>
//                       </div>
//                     </div>

//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm font-medium rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       <span>Sign Out</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default Navigation;

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

  // useEffect(() => {
  //   const handleScroll = () => setIsScrolled(window.scrollY > 20);
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  useMotionValueEvent(scrollY, 'change', latest => {
    setIsScrolled(latest > 20);
  });

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (userMenuRef.current && !userMenuRef.current.contains(event)) {
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
          <nav className="hidden md:flex items-center gap-8">
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
                onClick={() => navigate('/register')}
                className="hidden md:flex px-5 py-2.5 rounded-lg bg-white text-[#10120F] text-sm font-bold tracking-wide hover:bg-[#C2CABB] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
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
                  <Terminal className="w-4 h-4 text-white" /> {/* Updated icon */}
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
                <button
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 rounded-xl bg-white text-[#10120F] font-bold text-center hover:bg-[#C2CABB] transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
