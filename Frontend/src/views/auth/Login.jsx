// import { motion } from 'framer-motion';
// import { Eye, EyeOff, Lock, User, Users } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAppDispatch, useAppSelector } from '../../store/hooks';
// import { loginUser, clearError } from '../../store/slices/authSlice';
// import Navigation from '../../components/layout/Navigation';

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useAppDispatch();

//   // Form state
//   const [formData, setFormData] = useState({
//     teamName: '',
//     username: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   // Redux state
//   const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);
//   const { isDarkMode } = useAppSelector(state => state.ui);

//   /* ========== REDIRECT AUTHENTICATED USERS ========== */
//   useEffect(() => {
//     // Only redirect if we're actually on the login page AND authenticated
//     if (isAuthenticated && location.pathname === '/login') {
//       // Use replace to prevent back button issues
//       navigate('/dashboard', { replace: true });
//     }
//   }, [isAuthenticated, navigate, location.pathname]);

//   /* ========== CLEAR ERRORS ON MOUNT ========== */
//   useEffect(() => {
//     dispatch(clearError());

//     // Cleanup on unmount
//     return () => {
//       dispatch(clearError());
//     };
//   }, [dispatch]);

//   /* ========== HANDLE FORM SUBMIT ========== */
//   const handleSubmit = async e => {
//     e.preventDefault();

//     // Validate form
//     if (!formData.username.trim() || !formData.teamName.trim() || !formData.password) {
//       dispatch(clearError());
//       return;
//     }

//     try {
//       // Dispatch login action
//       const result = await dispatch(loginUser(formData)).unwrap();

//       // On success, navigate will happen via useEffect above
//       console.log('✅ Login successful:', result);
//     } catch (err) {
//       // Error is handled by Redux
//       console.error('❌ Login failed:', err);
//     }
//   };

//   /* ========== HANDLE INPUT CHANGE ========== */
//   const handleChange = e => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));

//     // Clear error when user types
//     if (error) {
//       dispatch(clearError());
//     }
//   };

//   /* ========== HANDLE THEME TOGGLE ========== */
//   const handleThemeToggle = () => {
//     dispatch(toggleTheme());
//   };

//   /* ========== PREVENT RENDER IF AUTHENTICATED ========== */
//   // Don't render login form if already authenticated
//   if (isAuthenticated && location.pathname === '/login') {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Redirecting to dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   /* ========== RENDER ========== */
//   return (
//     <div
//       className={`min-h-screen transition-all duration-500 ${
//         isDarkMode
//           ? 'bg-gradient-to-br from-gray-900 via-gray-900/80 to-gray-900'
//           : 'bg-gradient-to-br from-gray-200 via-blue-50/30 to-gray-300'
//       }`}
//     >
//       <Navigation isDarkMode={isDarkMode} toggleTheme={handleThemeToggle} showUserActions={false} />

//       <div className="flex items-center justify-center px-4 py-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="w-full max-w-md"
//         >
//           <div
//             className={`backdrop-blur-md rounded-2xl shadow-xl border overflow-hidden ${
//               isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/60 border-gray-200/50'
//             }`}
//           >
//             {/* Header */}
//             <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-8 text-center">
//               <motion.div
//                 className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center"
//                 whileHover={{ scale: 1.1, rotate: 5 }}
//                 transition={{ type: 'spring', stiffness: 300 }}
//               >
//                 <Lock className="w-8 h-8 text-white" />
//               </motion.div>
//               <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
//               <p className="text-blue-100 text-sm">Sign in to your CodeX account</p>
//             </div>

//             {/* Form */}
//             <div className="p-6">
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 {/* Error Message */}
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
//                   >
//                     <div className="flex items-center">
//                       <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
//                       <p className="text-red-400 text-sm">{error}</p>
//                     </div>
//                   </motion.div>
//                 )}

//                 {/* Username Field */}
//                 <div>
//                   <label
//                     className={`block text-sm font-medium mb-2 ${
//                       isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                     }`}
//                   >
//                     Username
//                   </label>
//                   <div className="relative">
//                     <User
//                       className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
//                         isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                       }`}
//                     />
//                     <input
//                       className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         isDarkMode
//                           ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
//                           : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
//                       }`}
//                       type="text"
//                       name="username"
//                       value={formData.username}
//                       onChange={handleChange}
//                       placeholder="Enter your username"
//                       required
//                       autoComplete="username"
//                     />
//                   </div>
//                 </div>

//                 {/* Team Name Field */}
//                 <div>
//                   <label
//                     className={`block text-sm font-medium mb-2 ${
//                       isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                     }`}
//                   >
//                     Team Name
//                   </label>
//                   <div className="relative">
//                     <Users
//                       className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
//                         isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                       }`}
//                     />
//                     <input
//                       className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         isDarkMode
//                           ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
//                           : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
//                       }`}
//                       type="text"
//                       name="teamName"
//                       value={formData.teamName}
//                       onChange={handleChange}
//                       placeholder="Enter your team name"
//                       required
//                       autoComplete="organization"
//                     />
//                   </div>
//                 </div>

//                 {/* Password Field */}
//                 <div>
//                   <label
//                     className={`block text-sm font-medium mb-2 ${
//                       isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                     }`}
//                   >
//                     Password
//                   </label>
//                   <div className="relative">
//                     <Lock
//                       className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
//                         isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                       }`}
//                     />
//                     <input
//                       className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         isDarkMode
//                           ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
//                           : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
//                       }`}
//                       type={showPassword ? 'text' : 'password'}
//                       name="password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       placeholder="Enter your password"
//                       required
//                       autoComplete="current-password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
//                         isDarkMode
//                           ? 'text-gray-400 hover:text-gray-300'
//                           : 'text-gray-500 hover:text-gray-600'
//                       }`}
//                     >
//                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <motion.button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
//                   whileHover={{ scale: isLoading ? 1 : 1.02 }}
//                   whileTap={{ scale: isLoading ? 1 : 0.98 }}
//                 >
//                   {isLoading ? (
//                     <div className="flex items-center justify-center space-x-2">
//                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                       <span>Signing in...</span>
//                     </div>
//                   ) : (
//                     'Sign In'
//                   )}
//                 </motion.button>
//               </form>

//               {/* Demo Credentials */}
//               <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10">
//                 <h3
//                   className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
//                 >
//                   Demo Credentials:
//                 </h3>
//                 <ul
//                   className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}
//                 >
//                   <li>
//                     <strong>Username:</strong> john
//                   </li>
//                   <li>
//                     <strong>Team Name:</strong> Alpha
//                   </li>
//                   <li>
//                     <strong>Password:</strong> password123
//                   </li>
//                 </ul>
//               </div>

//               {/* Register Link */}
//               <div className="mt-6 text-center">
//                 <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
//                   Don't have a team yet?{' '}
//                   <button
//                     type="button"
//                     onClick={() => navigate('/register')}
//                     className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
//                   >
//                     Create one here
//                   </button>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Login;




import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, User, Users, ChevronRight, CornerDownRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HUDLabel, LEDIndicator } from '../../components/HUD';


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Preserved state structure
  const [formData, setFormData] = useState({
    teamName: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
  const [isAuthenticated] = useState(false);
  const [isDarkMode] = useState(true);

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.teamName.trim() || !formData.password) {
      setError("Please complete all required fields.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      if (formData.username === 'john' && formData.password === 'password123') {
        console.log(' Login successful');
      } else {
        setError('UNAUTHORIZED ACCESS: Invalid credentials provided.');
      }
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };



  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const lineVariants = {
    initial: { scaleX: 0 },
    animate: {
      scaleX: 1,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };


  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0B0E11] text-[#E6E8E5] overflow-hidden">
      {/* Background Layering */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#17E1FF]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header - Floating minimalist style */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-8 h-8 flex items-center justify-center border border-white/20">
            <span className="text-[10px] font-mono">CX</span>
          </div>
          <h1 className="text-xl font-bold tracking-[-0.05em] uppercase">CODEX / SYSTEMS</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex gap-12"
        >
          <HUDLabel label="STATUS" value="SYSTEM ONLINE" />
          <HUDLabel label="ID" value="N.285-AUTH" />
          <HUDLabel label="LOCATION" value="US-EAST-01" />
        </motion.div>
      </nav>

      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-2xl"
        >
          {/* Main Title - Kinetic Typography style */}
          <div className="mb-20 space-y-2">
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <LEDIndicator />
              <span className="text-[12px] font-mono tracking-[0.4em] text-white/40 uppercase">01 / AUTHENTICATION</span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-[-0.03em] uppercase leading-none"
            >
              Let's make your <br />
              <span className="text-[#17E1FF]">Project Special</span>
            </motion.h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Input Groups - Max Milkin Underline Style */}
            <div className="space-y-16">
              <motion.div variants={itemVariants} className="relative group">
                <label className="block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold text-white/40 mb-2 group-focus-within:text-[#17E1FF] transition-colors">
                  USERNAME*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                    placeholder="ENTER YOUR IDENTIFIER"
                    className="w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none placeholder:text-white/10 uppercase"
                  />
                  <motion.div
                    variants={lineVariants}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20 origin-left"
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <label className="block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold text-white/40 mb-2 group-focus-within:text-[#17E1FF] transition-colors">
                  TEAM NAME*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    autoComplete="organization"
                    required
                    placeholder="TEAM ALPHA / OMEGA"
                    className="w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none placeholder:text-white/10 uppercase"
                  />
                  <motion.div
                    variants={lineVariants}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20 origin-left"
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <label className="block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold text-white/40 mb-2 group-focus-within:text-[#17E1FF] transition-colors">
                  PASSWORD*
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    placeholder="SECURE ACCESS KEY"
                    className="w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none placeholder:text-white/10 uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <motion.div
                    variants={lineVariants}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20 origin-left"
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>
            </div>

            {/* Actions Section */}
            <motion.div variants={itemVariants} className="pt-10 flex flex-col md:flex-row items-center gap-8 md:justify-between">
              <div className="flex flex-col gap-6 w-full md:w-auto">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase text-white/40 tracking-[0.2em]">Quick Selection (Demo)</span>
                  <div className="flex gap-2">
                    {['john', 'admin', 'guest'].map((user) => (
                      <button
                        key={user}
                        type="button"
                        onClick={() => setFormData(p => ({...p, username: user}))}
                        className={`px-6 py-2 rounded-full border text-[11px] font-mono transition-all duration-300 ${formData.username === user ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:border-white/40'}`}
                      >
                        {user.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3 text-red-400"
                    >
                      <CornerDownRight size={16} className="mt-1 flex-shrink-0" />
                      <p className="text-xs font-mono uppercase tracking-tight">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full md:w-56 h-16 flex items-center justify-center overflow-hidden rounded-full border border-white/20 hover:border-[#17E1FF] transition-colors"
              >
                <motion.div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                <span className="relative z-10 font-bold uppercase tracking-[0.2em] group-hover:text-black transition-colors duration-300">
                  {isLoading ? 'Processing...' : 'Confirm Access'}
                </span>
                {!isLoading && (
                  <ChevronRight size={18} className="relative z-10 ml-2 group-hover:text-black transition-colors" />
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Minimal Register Link */}
          <motion.div
            variants={itemVariants}
            className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <p className="text-[12px] text-white/40 font-mono">
              UNREGISTERED? <button onClick={() => navigate('/register')} className="text-white hover:text-[#17E1FF] underline decoration-white/20 transition-all">INITIALIZE NEW PROTOCOL</button>
            </p>
            <div className="flex gap-8">
              <HUDLabel label="ENCRYPTION" value="AES-256" />
              <HUDLabel label="PROTOCOL" value="TLS 1.3" />
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer - Minimal Aerospace Dock */}
      <footer className="relative z-50 p-8 flex flex-col md:flex-row justify-between items-center border-t border-white/5 bg-[#0B0E11]/80 backdrop-blur-xl">
        <div className="flex gap-12 text-[10px] font-mono tracking-widest text-white/40 uppercase">
          <span>&copy; 2024 CODEX SYSTEMS</span>
          <span className="hidden md:inline">DESIGNED FOR EXCELLENCE</span>
        </div>
        <div className="flex gap-8 mt-4 md:mt-0">
          {['Privacy', 'Network', 'Nodes'].map(item => (
            <a key={item} href="#" className="text-[10px] font-mono uppercase text-white/40 hover:text-white transition-colors">{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Login;
