import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Terminal, ChevronRight, CornerDownRight, Cpu, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createProject } from '../../store/slices/projectSlice';
import { useTheme } from '../../context/ThemeContext';
import { notify } from '../../lib/notify';
import { HUDLabel, LEDIndicator } from '../../components/HUD';

// --- Constants ---
const FRAMEWORKS = [
  { id: 'react', label: 'React', icon: Globe },
  { id: 'next', label: 'Next.js', icon: Zap },
  { id: 'node', label: 'Node.js', icon: Cpu },
  { id: 'python', label: 'Python', icon: Terminal },
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const lineVariants = {
  initial: { scaleX: 0 },
  focused: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const CreateProject = () => {
  // State
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    framework: '',
  });
  const [focusedField, setFocusedField] = useState(null);

  // Hooks
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.projects);
  const { isDarkMode } = useTheme();

  // Handlers
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      notify('Project name is required');
      return;
    }

    const result = await dispatch(createProject({ projectName: formData.projectName }));
    if (createProject.fulfilled.match(result)) {
      notify('System Initialized: Project Created');
      navigate('/');
    } else {
      notify('Failed to create project');
    }
  };

  const handleFrameworkSelect = id => {
    setFormData(prev => ({ ...prev, framework: id }));
  };

  const goBack = () => navigate('/');

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col overflow-hidden transition-colors duration-500 ${
        isDarkMode ? 'bg-[#0B0E11] text-[#E6E8E5]' : 'bg-[#F4F6F5] text-[#10120F]'
      }`}
    >
      {/* Background HUD Layers */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div
        className={`absolute top-[-15%] right-[-10%] w-[50%] h-[50%] blur-[140px] rounded-full pointer-events-none transition-colors duration-1000 ${
          isDarkMode ? 'bg-[#17E1FF]/5' : 'bg-blue-400/8'
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${
          isDarkMode ? 'bg-white/5' : 'bg-purple-400/8'
        }`}
      />

      {/* --- Header / Navigation --- */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 md:gap-4 cursor-pointer group"
          onClick={goBack}
        >
          <div
            className={`relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl border overflow-hidden transition-all duration-300 ${
              isDarkMode
                ? 'bg-[#C2CABB]/5 border-[#C2CABB]/10 group-hover:border-[#C2CABB]/30 group-hover:shadow-[0_0_12px_rgba(194,202,187,0.2)]'
                : 'bg-gray-800/5 border-gray-800/10 group-hover:border-gray-800/30 group-hover:shadow-[0_0_12px_rgba(0,0,0,0.1)]'
            }`}
          >
            <ArrowLeft
              className={`w-4 h-4 md:w-5 md:h-5 relative z-10 transition-colors ${
                isDarkMode ? 'text-[#C2CABB]' : 'text-gray-800'
              }`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                isDarkMode ? 'from-white/10 to-transparent' : 'from-gray-800/10 to-transparent'
              }`}
            />
          </div>
          <h1
            className={`text-base md:text-xl font-black tracking-[-0.05em] uppercase transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            CODEX / SYSTEMS
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:flex items-center gap-8 xl:gap-12"
        >
          <HUDLabel label="SYSTEM" value="INITIALIZING" />
          <HUDLabel label="USER" value="ADMIN_01" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:block"
        >
          <HUDLabel label="STATUS" value="READY" />
        </motion.div>
      </nav>

      {/* --- Main Content --- */}
      <main className="relative flex-1 flex flex-col justify-center px-6 py-8 md:py-12 lg:px-20 max-w-7xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl"
        >
          {/* Title Section */}
          <div className="mb-12 md:mb-16 lg:mb-20 space-y-3 md:space-y-4">
            <motion.div variants={itemVariants} className="flex items-center gap-2 md:gap-3">
              <LEDIndicator active={true} />
              <span
                className={`text-[10px] md:text-[11px] font-mono tracking-[0.3em] md:tracking-[0.4em] uppercase font-bold transition-colors ${
                  isDarkMode ? 'text-white/40' : 'text-gray-900/60'
                }`}
              >
                Project // Sequence 01
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className={`text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-[-0.03em] uppercase leading-none transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Let's build your <br />
              <span className={isDarkMode ? 'text-[#17E1FF]' : 'text-[#17E1FF]'}>
                Next Big Thing
              </span>
            </motion.h1>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-10 md:space-y-14 lg:space-y-16">
            {/* Input: Project Name */}
            <motion.div variants={itemVariants} className="relative group">
              <label
                htmlFor="projectName"
                className={`block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold mb-2 md:mb-3 transition-colors ${
                  focusedField === 'projectName'
                    ? isDarkMode
                      ? 'text-[#17E1FF]'
                      : 'text-[#17E1FF]'
                    : isDarkMode
                      ? 'text-white/40'
                      : 'text-gray-900/60'
                }`}
              >
                Project Identifier*
              </label>
              <div className="relative">
                <input
                  id="projectName"
                  type="text"
                  value={formData.projectName}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  onFocus={() => setFocusedField('projectName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="ENTER YOUR NEW PROJECT NAME"
                  className={`w-full bg-transparent py-3 md:py-4 text-lg md:text-2xl lg:text-3xl font-light tracking-tight focus:outline-none uppercase transition-colors ${
                    isDarkMode
                      ? 'text-white placeholder:text-white/10'
                      : 'text-gray-900 placeholder:text-gray-900/40'
                  }`}
                  autoComplete="off"
                />

                {/* Animated Line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-gray-900/40'}`}
                />
                <motion.div
                  variants={lineVariants}
                  initial="initial"
                  animate={focusedField === 'projectName' ? 'focused' : 'initial'}
                  className={`absolute bottom-0 left-0 right-0 h-[2px] origin-left ${isDarkMode ? 'bg-[#17E1FF]' : 'bg-[#17E1FF]'}`}
                />
              </div>
            </motion.div>

            {/* Input: Description */}
            <motion.div variants={itemVariants} className="relative group">
              <label
                htmlFor="description"
                className={`block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold mb-2 md:mb-3 transition-colors ${
                  focusedField === 'description'
                    ? isDarkMode
                      ? 'text-[#17E1FF]'
                      : 'text-[#17E1FF]'
                    : isDarkMode
                      ? 'text-white/40'
                      : 'text-gray-900/60'
                }`}
              >
                Brief Description
              </label>
              <div className="relative">
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="WHAT ARE WE BUILDING TODAY?"
                  className={`w-full bg-transparent py-3 md:py-4 text-lg md:text-2xl lg:text-3xl font-light tracking-tight focus:outline-none uppercase transition-colors ${
                    isDarkMode
                      ? 'text-white placeholder:text-white/10'
                      : 'text-gray-900 placeholder:text-gray-900/40'
                  }`}
                  autoComplete="off"
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 h-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-gray-900/40'}`}
                />
                <motion.div
                  variants={lineVariants}
                  initial="initial"
                  animate={focusedField === 'description' ? 'focused' : 'initial'}
                  className={`absolute bottom-0 left-0 right-0 h-[2px] origin-left ${isDarkMode ? 'bg-[#17E1FF]' : 'bg-[#17E1FF]'}`}
                />
              </div>
            </motion.div>

            {/* Framework Selection (Chips) */}
            <motion.div variants={itemVariants} className="space-y-4 md:space-y-6 pt-2 md:pt-4">
              <label
                className={`block text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-mono font-bold transition-colors ${
                  isDarkMode ? 'text-white/40' : 'text-gray-900/60'
                }`}
              >
                Tech Stack Environment
              </label>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {FRAMEWORKS.map(fw => {
                  const IconComponent = fw.icon;
                  const isSelected = formData.framework === fw.id;
                  return (
                    <button
                      key={fw.id}
                      type="button"
                      onClick={() => handleFrameworkSelect(fw.id)}
                      className={`group relative px-4 py-2.5 md:px-6 md:py-3 rounded-full border transition-all duration-300 flex items-center gap-2 ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-white text-black border-white'
                            : 'bg-gray-900 text-white border-gray-900'
                          : isDarkMode
                            ? 'bg-transparent text-white/40 border-white/10 hover:border-[#17E1FF] hover:text-[#17E1FF]'
                            : 'bg-transparent text-gray-900/60 border-gray-900/40 hover:border-[#17E1FF] hover:text-[#17E1FF]'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider">
                        {fw.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Action Bar */}
            <motion.div
              variants={itemVariants}
              className={`pt-8 md:pt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8 border-t mt-6 md:mt-8 transition-colors ${
                isDarkMode ? 'border-white/5' : 'border-gray-900/5'
              }`}
            >
              <div className="flex items-start gap-2 md:gap-3 opacity-60">
                <CornerDownRight
                  className={`w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 md:mt-1 flex-shrink-0 ${
                    isDarkMode ? 'text-[#17E1FF]' : 'text-[#17E1FF]'
                  }`}
                />
                <p
                  className={`text-[10px] md:text-xs max-w-[240px] font-mono leading-relaxed transition-colors ${
                    isDarkMode ? 'text-white/60' : 'text-gray-900/60'
                  }`}
                >
                  SYSTEM WILL AUTO-GENERATE REPO & CI/CD PIPELINES
                </p>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.05 } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
                className={`group relative w-full md:w-auto md:min-w-[240px] lg:min-w-[280px] h-14 md:h-16 lg:h-20 rounded-full overflow-hidden flex items-center justify-center transition-all border ${
                  isDarkMode
                    ? 'border-white/20 hover:border-[#17E1FF]'
                    : 'border-gray-900/20 hover:border-[#17E1FF]'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <motion.div
                  className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isDarkMode ? 'bg-white' : 'bg-gray-900'
                  }`}
                />

                <div className="relative z-10 flex items-center gap-2 md:gap-3">
                  <span
                    className={`font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm transition-colors duration-300 ${
                      isDarkMode
                        ? 'text-white group-hover:text-black'
                        : 'text-gray-900 group-hover:text-white'
                    }`}
                  >
                    {isLoading ? 'Initializing...' : 'Initialize Project'}
                  </span>
                  {!isLoading && (
                    <ChevronRight
                      className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${
                        isDarkMode
                          ? 'text-white group-hover:text-black'
                          : 'text-gray-900 group-hover:text-white'
                      }`}
                    />
                  )}
                </div>
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </main>

      {/* --- Footer --- */}
      <footer
        className={`relative z-10 border-t py-6 md:py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 backdrop-blur-sm transition-colors ${
          isDarkMode ? 'border-white/5 bg-[#0B0E11]/80' : 'border-gray-900/5 bg-[#F4F6F5]/80'
        }`}
      >
        <div
          className={`flex flex-col md:flex-row items-center gap-4 md:gap-8 lg:gap-16 text-[10px] font-mono tracking-widest uppercase transition-colors ${
            isDarkMode ? 'text-white/40' : 'text-gray-900/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-[#17E1FF]' : 'bg-[#17E1FF]'}`}
            />
            <span>Codex Systems v2.0</span>
          </div>
          <span
            className={`hidden md:inline border-l pl-8 lg:pl-16 ${
              isDarkMode ? 'border-white/10' : 'border-gray-900/40'
            }`}
          >
            Designed for Excellence
          </span>
        </div>
        <div
          className={`flex gap-6 md:gap-8 lg:gap-10 text-[10px] font-mono uppercase tracking-widest transition-colors ${
            isDarkMode ? 'text-white/30 hover:text-white' : 'text-gray-900/30'
          }`}
        >
          <span
            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}
          >
            Documentation
          </span>
          <span
            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}
          >
            Support
          </span>
          <span
            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}
          >
            License
          </span>
        </div>
      </footer>
    </div>
  );
};

export default CreateProject;
