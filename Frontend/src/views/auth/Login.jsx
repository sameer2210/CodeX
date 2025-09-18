import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/uiSlice';
import Navigation from '../../components/layout/Navigation';

const Login = () => {
  const [formData, setFormData] = useState({ teamName: '', username: '', password: '' });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);
  const { isDarkMode } = useAppSelector(state => state.ui);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (result.type === 'auth/login/fulfilled') {
      navigate('/dashboard');
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-900/80 to-gray-900'
          : 'bg-gradient-to-br from-gray-200 via-blue-50/30 to-gray-300'
      }`}
    >
      <Navigation isDarkMode={isDarkMode} toggleTheme={handleThemeToggle} showUserActions={false} />

      <div className="flex items-center justify-center px-2 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div
            className={`backdrop-blur-md rounded-2xl shadow-xl border overflow-hidden ${
              isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/60 border-gray-200/50'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-gray-600 px-8 py-8 text-center">
              <motion.div
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Lock className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-blue-100 text-sm">Sign in to your CodeX account</p>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Username Field */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
                {/* Team Name Field */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Team Name
                  </label>
                  <div className="relative">
                    <Users
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      type="text"
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleChange}
                      placeholder="Enter your team name"
                      required
                    />
                  </div>
                </div>
                {/* Password Field */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      // type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-gray-500 hover:text-gray-600'
                      }`}
                    >
                      {/* {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />} */}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-gray-600 hover:from-gray-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </form>

              {/* Demo Credentials Box */}
              <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10">
                <h3
                  className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Use these demo credentials to login:
                </h3>
                <ul
                  className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}
                >
                  <li>
                    <strong>Username:</strong> your name
                  </li>
                  <li>
                    <strong>Team Name:</strong> Alpha
                  </li>
                  <li>
                    <strong>Password:</strong> password123
                  </li>
                </ul>
              </div>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                  Don't have a team yet?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Create one here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
