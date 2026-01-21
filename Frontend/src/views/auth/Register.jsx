import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, CornerDownRight, Eye, EyeOff, Terminal, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HUDLabel, LEDIndicator } from '../../components/HUD';
import { useTheme } from '../../context/ThemeContext';
import { notify } from '../../lib/notify';
import { useAppDispatch } from '../../store/hooks';
import { clearError, registerUser } from '../../store/slices/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Core state for registration
  const [formData, setFormData] = useState({
    teamName: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  // Form handling
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.teamName.trim() || !formData.password) {
      setError('INITIALIZATION FAILED: MISSING MANDATORY PARAMETERS.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(result)) {
        notify('Registration successful', 'success');
        navigate('/login');
      } else {
        setError(result.payload || 'REGISTRATION FAILED');
      }
    } catch (err) {
      setError('SYSTEM ERROR. TRY AGAIN.');
      notify('Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation Variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const lineVariants = {
    initial: { scaleX: 0 },
    animate: {
      scaleX: 1,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
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
          <div className="relative w-10 h-10 flex items-center justify-center bg-[#C2CABB]/5 rounded-xl border border-[#C2CABB]/10 overflow-hidden group-hover:border-[#C2CABB]/30 transition-colors group-hover:shadow-[0_0_12px_rgba(194,202,187,0.2)]">
            <Terminal className="w-5 h-5 text-[#C2CABB] relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <h1 className="text-xl font-black tracking-[-0.05em] uppercase">CODEX / SYSTEMS</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex gap-12"
        >
          <HUDLabel label="SEQUENCE" value="NEW TEAM REGISTRATION" />
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
              <span className="text-[#17E1FF]">DOMAIN Legacy</span>
            </motion.h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-16">
              {/* Username Input */}
              <motion.div variants={itemVariants} className="relative group">
                <label className="block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold text-white/40 mb-2 group-focus-within:text-[#17E1FF] transition-colors">
                  USER IDENTIFIER*
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
                  <motion.div
                    variants={lineVariants}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 origin-left"
                  />
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
                  <motion.div
                    variants={lineVariants}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 origin-left"
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="relative group">
                <label className="block text-[10px] md:text-[12px]  tracking-[0.2em] font-mono font-bold text-white/40 mb-2 group-focus-within:text-[#17E1FF] transition-colors">
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
                    className="w-full bg-transparent py-4 text-xl md:text-2xl font-light tracking-tight focus:outline-none placeholder:text-white/10 "
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
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 origin-left"
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileFocus={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#17E1FF] origin-left transition-transform duration-500"
                  />
                </div>
              </motion.div>
            </div>

            {/* Form Actions Section */}
            <motion.div
              variants={itemVariants}
              className="pt-10 flex flex-col md:flex-row items-center gap-8 md:justify-between"
            >
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
                      <p className="text-xs font-mono uppercase tracking-tight font-bold">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Awaiting system confirmation
                  </p>
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
                  <ChevronRight
                    size={18}
                    className="relative z-10 ml-2 group-hover:text-black transition-colors"
                  />
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
                REGISTERED?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-white hover:text-[#17E1FF] underline decoration-white/20 transition-all font-bold"
                >
                  RE-ESTABLISH LINK
                </button>
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
          <span className="hidden md:inline border-l border-white/10 pl-16">
            DESIGNED FOR EXCELLENCE
          </span>
        </div>
        <div onClick={() => navigate('/')} className="flex gap-10 mt-6 md:mt-0">
          {['Privacy', 'Network', 'home'].map(item => (
            <a
              key={item}
              href="#"
              className="text-[10px] font-mono uppercase text-white/40 hover:text-white transition-colors tracking-widest"
            >
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Register;
