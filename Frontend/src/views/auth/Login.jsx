import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, CornerDownRight, Eye, EyeOff, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HUDLabel, LEDIndicator } from '../../components/HUD';
import { useTheme } from '../../context/ThemeContext';
import { notify } from '../../lib/notify';
import { useAppDispatch } from '../../store/hooks';
import { clearError, loginUser } from '../../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

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
  const { isDarkMode } = useTheme();

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.teamName.trim() || !formData.password) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await dispatch(loginUser(formData));

      if (loginUser.fulfilled.match(result)) {
        const { token, user } = result.payload;

        localStorage.setItem('token', token);
        notify('Login successful', 'success');

        console.log('LOGIN SUCCESS:', user);
        navigate('/dashboard');
      } else {
        notify(result.payload, 'error');
        throw new Error(result.payload || 'UNAUTHORIZED ACCESS');
      }
    } catch (err) {
      setError(err.message);
      notify('Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = e => {
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
          <div className="relative w-10 h-10 flex items-center justify-center bg-[#C2CABB]/5 rounded-xl border border-[#C2CABB]/10 overflow-hidden group-hover:border-[#C2CABB]/30 transition-colors group-hover:shadow-[0_0_12px_rgba(194,202,187,0.2)]">
            <Terminal className="w-5 h-5 text-[#C2CABB] relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
              <span className="text-[12px] font-mono tracking-[0.4em] text-white/40 uppercase">
                01 / AUTHENTICATION
              </span>
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
                <label className="block text-[10px] md:text-[12px]  tracking-[0.2em] font-mono font-bold text-white/40 mb-2 group-focus-within:text-[#17E1FF] transition-colors">
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
            <motion.div
              variants={itemVariants}
              className="pt-10 flex flex-col md:flex-row items-center gap-8 md:justify-between"
            >
              <div className="flex flex-col gap-6 w-full md:w-auto">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase text-white/40 tracking-[0.2em]">
                    Quick Selection (Demo)
                  </span>
                  <div className="flex gap-2">
                    {['john'].map(user => (
                      <button
                        key={user}
                        type="button"
                        onClick={() =>
                          setFormData({
                            username: 'john',
                            teamName: 'DemoTeam',
                            password: 'Demo123',
                          })
                        }
                        className="px-6 py-2 rounded-full border text-[11px] font-mono"
                      >
                        JOHN
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
                  <ChevronRight
                    size={18}
                    className="relative z-10 ml-2 group-hover:text-black transition-colors"
                  />
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
              UNREGISTERED?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-white hover:text-[#17E1FF] underline decoration-white/20 transition-all"
              >
                INITIALIZE NEW PROTOCOL
              </button>
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
            <a
              key={item}
              href="#"
              className="text-[10px] font-mono uppercase text-white/40 hover:text-white transition-colors"
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
