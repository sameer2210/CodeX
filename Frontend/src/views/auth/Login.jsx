import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, CornerDownRight, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HUDLabel, LEDIndicator } from '../../components/HUD';
import { useTheme } from '../../context/ThemeContext';
import { notify } from '../../lib/notify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, loginUser } from '../../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Local state
  const [formData, setFormData] = useState({
    teamName: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Redux state
  const isLoading = useAppSelector(state => state.auth.isLoading);
  const reduxError = useAppSelector(state => state.auth.error);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const { isDarkMode } = useTheme();

  // Combine local and redux errors
  const error = localError || reduxError;

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      setLocalError(null);
    };
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    // Clear previous errors
    setLocalError(null);
    dispatch(clearError());

    // Validation
    const trimmedUsername = (formData.username || '').trim();
    const trimmedTeamName = (formData.teamName || '').trim();
    if (!trimmedUsername || !trimmedTeamName || !formData.password) {
      setLocalError('Please complete all required fields.');
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          ...formData,
          username: trimmedUsername,
          teamName: trimmedTeamName,
        })
      );

      if (loginUser.fulfilled.match(result)) {
        notify('Login successful', 'success');
        navigate('/dashboard');
      } else {
        const errorMessage = result.payload || 'Login failed. Please try again.';
        setLocalError(errorMessage);
        notify(errorMessage, 'error');
      }
    } catch (err) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      setLocalError(errorMessage);
      notify('Login failed', 'error');
      console.error('Login error:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) {
      setLocalError(null);
      dispatch(clearError());
    }
  };

  const handleDemoFill = () => {
    setFormData(prev => ({
      ...prev,
      teamName: 'DemoTeam',
      password: 'Demo123',
    }));
    setLocalError(null);
    dispatch(clearError());
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
    <div
      className={`relative min-h-screen w-full flex flex-col overflow-hidden transition-colors duration-500 font-['Inter',_sans-serif] selection:bg-[#17E1FF] selection:text-black ${
        isDarkMode ? 'bg-[#0B0E11] text-[#E6E8E5]' : 'bg-[#F4F6F5] text-[#10120F]'
      }`}
    >
      {/* Background Layering (Landing Style) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />
      <div
        className={`fixed inset-0 pointer-events-none z-[1] ${
          isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.02]'
        }`}
        style={{
          backgroundImage: isDarkMode
            ? 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)'
            : 'linear-gradient(#0B0E11 1px, transparent 1px), linear-gradient(90deg, #0B0E11 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#17E1FF]/10 blur-[140px] rounded-full pointer-events-none z-[1]" />
      <div
        className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[140px] rounded-full pointer-events-none z-[1] ${
          isDarkMode ? 'bg-white/5' : 'bg-[#0B0E11]/5'
        }`}
      />

      {/* Header */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div
            className={`group relative w-10 h-10 flex items-center justify-center rounded-full border overflow-hidden transition-colors ${
              isDarkMode
                ? 'bg-[#C2CABB]/5 border-[#C2CABB]/10 group-hover:border-[#C2CABB]/30 group-hover:shadow-[0_0_12px_rgba(194,202,187,0.2)]'
                : 'bg-white/90 border-[#0B0E11]/15 group-hover:border-[#0B0E11]/30 group-hover:shadow-[0_0_12px_rgba(11,14,17,0.15)]'
            }`}
          >
            <img
              src="/logo.png"
              alt="CodeX logo"
              className="w-12 h-12 object-contain relative z-10"
              draggable="false"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <h1
            onClick={() => navigate('/')}
            className="text-xl font-bold tracking-[-0.05em] uppercase cursor-pointer"
          >
            CODEX / SYSTEMS
          </h1>
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

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-2xl"
        >
          {/* Title */}
          <div className="mb-20 space-y-2">
            <motion.div
              variants={itemVariants}
              className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full border backdrop-blur-sm ${
                isDarkMode ? 'border-white/10 bg-white/5' : 'border-[#0B0E11]/10 bg-white/80'
              }`}
            >
              <LEDIndicator />
              <span
                className={`text-[12px] font-mono tracking-[0.4em] uppercase ${
                  isDarkMode ? 'text-white/40' : 'text-[#0B0E11]/60'
                }`}
              >
                01 / AUTHENTICATION
              </span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-[-0.03em] uppercase leading-none"
            >
              Let's make your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#17E1FF] to-[#17E1FF]/40">
                Project Special
              </span>
            </motion.h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12" aria-busy={isLoading}>
            {/* Input Groups */}
            <div className="space-y-16">
              <motion.div variants={itemVariants} className="relative group">
                <label
                  className={`block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold mb-2 group-focus-within:text-[#17E1FF] transition-colors ${
                    isDarkMode ? 'text-white/40' : 'text-[#0B0E11]/70'
                  }`}
                >
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
                    disabled={isLoading}
                    placeholder="ENTER YOUR NAME"
                    className={`w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none uppercase disabled:opacity-50 ${
                      isDarkMode ? 'placeholder:text-white/10' : 'placeholder:text-[#0B0E11]/30'
                    }`}
                  />
                  <motion.div
                    variants={lineVariants}
                    className={`absolute bottom-0 left-0 right-0 h-[1px] origin-left ${
                      isDarkMode ? 'bg-white/20' : 'bg-[#0B0E11]/20'
                    }`}
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <label
                  className={`block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold mb-2 group-focus-within:text-[#17E1FF] transition-colors ${
                    isDarkMode ? 'text-white/40' : 'text-[#0B0E11]/70'
                  }`}
                >
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
                    disabled={isLoading}
                    placeholder="eg.  ALPHA / OMEGA"
                    className={`w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none uppercase disabled:opacity-50 ${
                      isDarkMode ? 'placeholder:text-white/10' : 'placeholder:text-[#0B0E11]/30'
                    }`}
                  />
                  <motion.div
                    variants={lineVariants}
                    className={`absolute bottom-0 left-0 right-0 h-[1px] origin-left ${
                      isDarkMode ? 'bg-white/20' : 'bg-[#0B0E11]/20'
                    }`}
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <label
                  className={`block text-[10px] md:text-[12px] tracking-[0.2em] font-mono font-bold mb-2 group-focus-within:text-[#17E1FF] transition-colors ${
                    isDarkMode ? 'text-white/40' : 'text-[#0B0E11]/70'
                  }`}
                >
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
                    disabled={isLoading}
                    placeholder="SECURE ACCESS KEY"
                    className={`w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none disabled:opacity-50 ${
                      isDarkMode ? 'placeholder:text-white/10' : 'placeholder:text-[#0B0E11]/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className={`absolute right-0 transition-colors disabled:opacity-50 ${
                      isDarkMode
                        ? 'text-white/20 hover:text-white'
                        : 'text-[#0B0E11]/40 hover:text-[#0B0E11]'
                    }`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <motion.div
                    variants={lineVariants}
                    className={`absolute bottom-0 left-0 right-0 h-[1px] origin-left ${
                      isDarkMode ? 'bg-white/20' : 'bg-[#0B0E11]/20'
                    }`}
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
            <motion.div
              variants={itemVariants}
              className="pt-10 flex flex-col md:flex-row items-center gap-8 md:justify-between"
            >
              <div className="flex flex-col gap-6 w-full md:w-auto">
                <div className="flex flex-col gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-[0.2em] ${
                      isDarkMode ? 'text-white/40' : 'text-[#0B0E11]/60'
                    }`}
                  >
                    Quick Selection (Demo)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDemoFill}
                      disabled={isLoading}
                      className={`px-6 py-2 rounded-full border text-[11px] font-mono transition-colors disabled:opacity-50 ${
                        isDarkMode
                          ? 'border-white/20 hover:border-[#17E1FF]'
                          : 'border-[#0B0E11]/20 hover:border-[#17E1FF] hover:bg-[#0B0E11]/5'
                      }`}
                    >
                      Demo Credentials
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
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
                aria-disabled={isLoading}
                aria-busy={isLoading}
                tabIndex={isLoading ? -1 : 0}
                whileHover={!isLoading ? { scale: 1.05 } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
                className={`group relative w-full md:w-56 h-16 flex items-center justify-center overflow-hidden rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'border-white/20 hover:border-[#17E1FF] shadow-[0_0_40px_rgba(23,225,255,0.18)]'
                    : 'border-[#0B0E11]/20 hover:border-[#0B0E11]/40 shadow-[0_0_30px_rgba(11,14,17,0.08)]'
                }`}
              >
                <motion.div
                  className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isDarkMode ? 'bg-white' : 'bg-[#0B0E11]'
                  }`}
                />
                <span
                  className={`relative z-10 font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                    isDarkMode ? 'group-hover:text-black' : 'group-hover:text-white'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Confirm Access'}
                </span>
                {!isLoading && (
                  <ChevronRight
                    size={18}
                    className={`relative z-10 ml-2 transition-colors ${
                      isDarkMode ? 'group-hover:text-black' : 'group-hover:text-white'
                    }`}
                  />
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Register Link */}
          <motion.div
            variants={itemVariants}
            className={`mt-20 pt-8 border-t flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              isDarkMode ? 'border-white/5' : 'border-[#0B0E11]/10'
            }`}
          >
            <p
              className={`text-[14px] font-mono font-bold ${
                isDarkMode ? 'text-white/40' : 'text-[#0B0E11]/70'
              }`}
            >
              UNREGISTERED?{' '}
              <button
                onClick={() => navigate('/register')}
                className={`underline transition-all ${
                  isDarkMode
                    ? 'text-white hover:text-[#17E1FF] decoration-white/20'
                    : 'text-[#07090a] hover:text-[#17E1FF] decoration-[#0B0E11]/30'
                }`}
              >
                REGISTERED NEW USER
              </button>
            </p>
            <div className="flex gap-8">
              <HUDLabel label="ENCRYPTION" value="AES-256" />
              <HUDLabel label="PROTOCOL" value="TLS 1.3" />
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className={`relative z-50 p-8 flex flex-col md:flex-row justify-between items-center border-t backdrop-blur-xl ${
          isDarkMode ? 'border-white/5 bg-[#0B0E11]/80' : 'border-[#0B0E11]/10 bg-white/85'
        }`}
      >
        <div
          className={`flex gap-12 text-[10px] font-mono tracking-widest uppercase ${
            isDarkMode ? 'text-white/40' : 'text-[#0B0E11]/60'
          }`}
        >
          <span>&copy; 2024 CODEX SYSTEMS</span>
          <span className="hidden md:inline">DESIGNED FOR EXCELLENCE</span>
        </div>
        <div className="flex gap-8 mt-4 md:mt-0">
          {['Privacy', 'Network', 'home'].map(item => (
            <a
              key={item}
              href="/"
              className={`text-[10px] font-mono uppercase transition-colors ${
                isDarkMode
                  ? 'text-white/40 hover:text-white'
                  : 'text-[#0B0E11]/60 hover:text-[#0B0E11]'
              }`}
            >
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Login;
