import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Code2, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsLoading(true);
    try {
      await axios.post('https://ai-jlvm.onrender.com/projects/create', {
        projectName,
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}
    >
      {/* Header */}
      <header
        className={`${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
        } backdrop-blur-md border-b px-4 py-3`}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={goBack}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Code Editor
            </h1>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        <motion.section
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`relative w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-md border transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800/30 border-gray-600/30' : 'bg-white/40 border-white/50'
          }`}
        >
          {/* Header Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Code2 className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-3xl font-bold text-center mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Create a New Project
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`text-center mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Start building something amazing with AI assistance
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="projectName"
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                name="projectName"
                placeholder="Enter your project name..."
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm'
                    : 'bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                }`}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !projectName.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Project...</span>
                </>
              ) : (
                <span>Create Project</span>
              )}
            </motion.button>
          </motion.form>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-gray-600/30"
          >
            <p
              className={`text-sm text-center mb-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Your project will include:
            </p>
            <div className="space-y-2 text-sm">
              <div
                className={`flex items-center space-x-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>AI-powered code assistance</span>
              </div>
              <div
                className={`flex items-center space-x-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Real-time collaboration</span>
              </div>
              <div
                className={`flex items-center space-x-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Intelligent code review</span>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
};

export default CreateProject;
