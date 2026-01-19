// import { motion } from 'framer-motion';
// import { Eye, EyeOff, Lock, User, UserPlus, Users } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAppDispatch, useAppSelector } from '../../store/hooks';
// import { registerUser, clearError } from '../../store/slices/authSlice';
// import { toggleTheme } from '../../store/slices/uiSlice';

// import Navigation from '../../components/layout/Navigation';
// import { useTheme } from '../../context/ThemeContext';

// const Register = () => {
//   const [formData, setFormData] = useState({ teamName: '', username: '', password: '' });
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();

//   const { isLoading, error } = useAppSelector(state => state.auth);
//   const { isDarkMode } = useAppSelector(state => state.ui);

//   useEffect(() => {
//     return () => {
//       dispatch(clearError());
//     };
//   }, [dispatch]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const result = await dispatch(registerUser(formData));
//     if (result.type === 'auth/register/fulfilled') {
//       navigate('/login');
//     }
//   };

//   const handleThemeToggle = () => {
//     dispatch(toggleTheme());
//   };

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (error) setError('');
//   };

//   return (
//     <div
//       className={`min-h-screen transition-all duration-500 ${
//         isDarkMode
//           ? 'bg-gradient-to-br from-gray-900 via-gray-900/80 to-gray-900'
//           : 'bg-gradient-to-br from-gray-200 via-blue-50/30 to-gray-300'
//       }`}
//     >
//       <Navigation isDarkMode={isDarkMode} toggleTheme={handleThemeToggle} showUserActions={false} />

//       <div className="flex items-center justify-center px-2 py-4">
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
//             <div className="bg-gradient-to-r from-blue-500 to-gray-600 px-8 py-8 text-center">
//               <motion.div
//                 className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center"
//                 whileHover={{ scale: 1.1, rotate: 5 }}
//                 transition={{ type: 'spring', stiffness: 300 }}
//               >
//                 <UserPlus className="w-8 h-8 text-white" />
//               </motion.div>
//               <h1 className="text-2xl font-bold text-white mb-2">Create Your Team</h1>
//               <p className="text-emerald-100 text-sm">Start your coding journey with CodeX</p>
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
//                       isDarkMode ? 'text-gray-200' : 'text-gray-700'
//                     }`}
//                   >
//                     Admin Username
//                   </label>
//                   <div className="relative">
//                     <User
//                       className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
//                         isDarkMode ? 'text-gray-200' : 'text-gray-500'
//                       }`}
//                     />
//                     <input
//                       className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
//                         isDarkMode
//                           ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
//                           : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
//                       }`}
//                       type="text"
//                       name="username"
//                       value={formData.username}
//                       onChange={handleChange}
//                       placeholder="Your admin username"
//                       required
//                     />
//                   </div>
//                   <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-500'}`}>
//                     You'll be the team administrator
//                   </p>
//                 </div>

//                 {/* Team Name Field */}
//                 <div>
//                   <label
//                     className={`block text-sm font-medium mb-2 ${
//                       isDarkMode ? 'text-gray-200' : 'text-gray-700'
//                     }`}
//                   >
//                     Team Name
//                   </label>
//                   <div className="relative">
//                     <Users
//                       className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
//                         isDarkMode ? 'text-gray-200' : 'text-gray-500'
//                       }`}
//                     />
//                     <input
//                       className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
//                         isDarkMode
//                           ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
//                           : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
//                       }`}
//                       type="text"
//                       name="teamName"
//                       value={formData.teamName}
//                       onChange={handleChange}
//                       placeholder="Choose a unique team name"
//                       required
//                     />
//                   </div>
//                   <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-500'}`}>
//                     This will be your team's unique identifier
//                   </p>
//                 </div>

//                 {/* Password Field */}
//                 <div>
//                   <label
//                     className={`block text-sm font-medium mb-2 ${
//                       isDarkMode ? 'text-gray-200' : 'text-gray-700'
//                     }`}
//                   >
//                     Team Password
//                   </label>
//                   <div className="relative">
//                     <Lock
//                       className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
//                         isDarkMode ? 'text-gray-200' : 'text-gray-500'
//                       }`}
//                     />
//                     <input
//                       className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
//                         isDarkMode
//                           ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
//                           : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
//                       }`}
//                       // type={showPassword ? 'text' : 'password'}
//                       name="password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       placeholder="Create a strong password"
//                       required
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
//                       {/* {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />} */}
//                     </button>
//                   </div>
//                   <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
//                     Share this with your team members for access
//                   </p>
//                 </div>

//                 {/* Submit Button */}
//                 <motion.button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full bg-gradient-to-r from-blue-500 to-gray-600 hover:from-gray-500 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   {isLoading ? (
//                     <div className="flex items-center justify-center space-x-2">
//                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                       <span>Creating team...</span>
//                     </div>
//                   ) : (
//                     'Create Team'
//                   )}
//                 </motion.button>
//               </form>

//               {/* Login Link */}
//               <div className="mt-6 text-center">
//                 <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
//                   Already have a team?{' '}
//                   <button
//                     onClick={() => navigate('/login')}
//                     className="text-blue-400 hover:text-blue-700 font-medium transition-colors"
//                   >
//                     Sign in here
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

// export default Register;





import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronRight, CornerDownRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HUDLabel, LEDIndicator } from '../../components/HUD';

const Register = () => {
  const navigate = useNavigate();

  // Core state for registration
  const [formData, setFormData] = useState({
    teamName: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.username.trim() || !formData.teamName.trim() || !formData.password) {
      setError("INITIALIZATION FAILED: MISSING MANDATORY PARAMETERS.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulated API Call
    setTimeout(() => {
      setIsLoading(false);
      // Logic would go here. For demo, we just navigate.
      console.log('Registering Protocol:', formData);
      navigate('/login');
    }, 2000);
  };

  // Animation Variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const lineVariants = {
    initial: { scaleX: 0 },
    animate: {
      scaleX: 1,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0B0E11] text-[#E6E8E5] overflow-hidden">
      {/* Background HUD Layers */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#17E1FF]/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Persistent Navigation Header */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 flex items-center justify-center border border-white/20">
            <span className="text-[10px] font-mono font-bold">CX</span>
          </div>
          <h1 className="text-xl font-black tracking-[-0.05em] uppercase">CODEX / SYSTEMS</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex gap-12"
        >
          <HUDLabel label="SEQUENCE" value="NEW REGISTRATION" />
          <HUDLabel label="AUTH_LEVEL" value="USER_LEVEL_01" />
          <HUDLabel label="ENCRYPTION" value="RSA-4096" />
        </motion.div>
      </nav>

      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-2xl"
        >
          {/* Section Header */}
          <div className="mb-16 space-y-4">
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <LEDIndicator />
              <span className="text-[12px] font-mono tracking-[0.4em] text-white/40 uppercase">
                00 / PROTOCOL INITIALIZATION
              </span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-[-0.03em] uppercase leading-none"
            >
              Start your <br />
              <span className="text-[#17E1FF]">Digital Legacy</span>
            </motion.h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-16">
              {/* Username Input */}
              <motion.div variants={itemVariants} className="relative group">
                <label className="block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold text-white/40 mb-2 group-focus-within:text-[#17E1FF] transition-colors">
                  ADMIN IDENTIFIER*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                    placeholder="DEFINE YOUR UNIQUE ID"
                    className="w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none placeholder:text-white/10 uppercase"
                  />
                  <motion.div variants={lineVariants} className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 origin-left" />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>

              {/* Team Name Input */}
              <motion.div variants={itemVariants} className="relative group">
                <label className="block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold text-white/40 mb-2 group-focus-within:text-[#17E1FF] transition-colors">
                  TEAM DESIGNATION*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    autoComplete="organization"
                    required
                    placeholder="ENTER SQUADRON NAME"
                    className="w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none placeholder:text-white/10 uppercase"
                  />
                  <motion.div variants={lineVariants} className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 origin-left" />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="relative group">
                <label className="block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold text-white/40 mb-2 group-focus-within:text-[#17E1FF] transition-colors">
                  ACCESS KEY*
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    placeholder="SECURE MASTER KEY"
                    className="w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none placeholder:text-white/10 uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <motion.div variants={lineVariants} className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 origin-left" />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>
            </div>

            {/* Form Actions Section */}
            <motion.div variants={itemVariants} className="pt-10 flex flex-col md:flex-row items-center gap-8 md:justify-between">
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3 text-red-400"
                    >
                      <CornerDownRight size={16} className="mt-1 flex-shrink-0" />
                      <p className="text-xs font-mono uppercase tracking-tight font-bold">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-3">
                   <div className="w-1 h-1 rounded-full bg-white/20" />
                   <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Awaiting system confirmation</p>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full md:w-64 h-20 flex items-center justify-center overflow-hidden rounded-full border border-white/20 hover:border-[#17E1FF] transition-all duration-300"
              >
                <motion.div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                <span className="relative z-10 font-bold uppercase tracking-[0.3em] text-[14px] group-hover:text-black transition-colors duration-300">
                  {isLoading ? 'DEPLOYING...' : 'INITIATE PROTOCOL'}
                </span>
                {!isLoading && (
                  <ChevronRight size={18} className="relative z-10 ml-2 group-hover:text-black transition-colors" />
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Protocol Links */}
          <motion.div
            variants={itemVariants}
            className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-3">
               <UserPlus size={16} className="text-white/20" />
               <p className="text-[12px] text-white/40 font-mono">
                REGISTERED? <button onClick={() => navigate('/login')} className="text-white hover:text-[#17E1FF] underline decoration-white/20 transition-all font-bold">RE-ESTABLISH LINK</button>
              </p>
            </div>

            <div className="flex gap-10">
              <HUDLabel label="NETWORK" value="SECURE" />
              <HUDLabel label="LATENCY" value="12MS" />
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Aerospacial Footer Dock */}
      <footer className="relative z-50 p-8 flex flex-col md:flex-row justify-between items-center border-t border-white/5 bg-[#0B0E11]/80 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-[10px] font-mono tracking-widest text-white/40 uppercase">
          <div className="flex items-center gap-2">
            <span className="text-white/10">©</span>
            <span>2024 CODEX / SYSTEMS</span>
          </div>
          <span className="hidden md:inline border-l border-white/10 pl-16">DESIGNED FOR EXCELLENCE</span>
        </div>
        <div className="flex gap-10 mt-6 md:mt-0">
          {['Privacy', 'Network', 'Nodes'].map(item => (
            <a key={item} href="#" className="text-[10px] font-mono uppercase text-white/40 hover:text-white transition-colors tracking-widest">{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Register;
