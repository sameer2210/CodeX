import {
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CommandLineIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { notify } from '../../../lib/notify';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  clearProjectData,
  fetchProject,
  setCurrentProject,
} from '../../../store/slices/projectSlice';
import ChatSection from './components/ChatSection';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import ReviewPanel from './components/ReviewPanel';

const EASE = [0.22, 1, 0.36, 1];

const Project = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Selectors
  const currentProject = useAppSelector(state => state.projects.currentProject);
  const isLoading = useAppSelector(state => state.projects.isLoading);
  const socketConnected = useAppSelector(state => state.socket.connected);
  const { isDarkMode } = useTheme();

  // Local state
  const [activeTab, setActiveTab] = useState('code'); // For mobile
  const [activeBottomTab, setActiveBottomTab] = useState('output'); // For output/review toggle
  const [isChatOpen, setIsChatOpen] = useState(true); // For tablet chat collapsible

  /* ========== PROJECT INITIALIZATION ========== */

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    // Fetch project data
    dispatch(fetchProject(projectId))
      .unwrap()
      .then(project => {
        dispatch(setCurrentProject(project));
        notify({ message: 'Project loaded successfully', type: 'success' });
      })
      .catch(error => {
        notify({
          message: error || 'Failed to load project',
          type: 'error',
        });
        navigate('/');
      });

    // Cleanup on unmount
    return () => {
      if (projectId) {
        dispatch(clearProjectData({ projectId }));
      }
    };
  }, [projectId, dispatch, navigate]);

  /* ========== SOCKET PROJECT ROOM ========== */

  useEffect(() => {
    if (!socketConnected || !currentProject?._id) return;

    // JOIN
    dispatch({
      type: 'socket/joinProject',
      payload: { projectId: currentProject._id },
    });

    console.log('🔌 Joined project room:', currentProject._id);

    // LEAVE on unmount
    return () => {
      if (socketConnected) {
        dispatch({
          type: 'socket/leaveProject',
          payload: { projectId: currentProject._id },
        });
        console.log('🔌 Left project room:', currentProject._id);
      }
    };
  }, [currentProject?._id, socketConnected, dispatch]);

  /* ========== LOADING STATE ========== */

  if (isLoading || !currentProject) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-[#0B0E11]' : 'bg-[#E6E8E5]'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#17E1FF] border-t-transparent rounded-full animate-spin"></div>
          <p className={`text-sm ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}>
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  /* ========== RENDER ========== */

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: EASE },
    },
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 relative ${
        isDarkMode ? 'bg-[#0B0E11] text-[#E6E8E5]' : 'bg-[#E6E8E5] text-[#0B0E11]'
      }`}
    >
      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />

      {/* Subtle Grid Background */}
      <div
        className={`fixed inset-0 pointer-events-none opacity-[0.02] z-[1] ${
          isDarkMode ? 'opacity-[0.02]' : 'opacity-[0.01]'
        }`}
        style={{
          backgroundImage: isDarkMode
            ? 'linear-gradient(#E6E8E5 1px, transparent 1px), linear-gradient(90deg, #E6E8E5 1px, transparent 1px)'
            : 'linear-gradient(#0B0E11 1px, transparent 1px), linear-gradient(90deg, #0B0E11 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      {/* Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#17E1FF]/10 rounded-full blur-[200px] opacity-30 pointer-events-none z-[1]" />

      {/* Main Content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-4 sm:p-6 lg:p-12 min-h-screen"
      >
        {/* Desktop Layout: ≥1024px - Split View */}
        <motion.div
          variants={itemVariants}
          className="hidden lg:flex flex-1 gap-6 h-[calc(100vh-96px)] overflow-hidden"
        >
          {/* Left: 70% - Code Editor + Bottom Tabs (Output/Review) */}
          <div className="flex flex-col w-[70%] gap-6 h-full">
            {/* Code Editor - Full Height Priority */}
            <div
              className={`flex-1 rounded-xl  border=2 border-white/10 overflow-hidden ${
                isDarkMode ? 'bg-white/5' : 'bg-white/60'
              }`}
            >
              <CodeEditor projectId={currentProject._id} />
            </div>

            {/* Bottom: Output / Review Tabs - Fixed Height */}
            <div
              className={`h-40 rounded-xl  border border-white/10 overflow-hidden ${
                isDarkMode ? 'bg-white/5' : 'bg-white/60'
              }`}
            >
              {/* Tabs with Icons */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveBottomTab('output')}
                  className={`flex-1 py-3 px-6 flex items-center justify-center transition-all ${
                    activeBottomTab === 'output'
                      ? 'bg-[#17E1FF]/10 border-b-2 border-[#17E1FF]'
                      : isDarkMode
                        ? 'hover:bg-white/5'
                        : 'hover:bg-[#0B0E11]/5'
                  }`}
                >
                  <CommandLineIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveBottomTab('review')}
                  className={`flex-1 py-3 px-6 flex items-center justify-center transition-all ${
                    activeBottomTab === 'review'
                      ? 'bg-[#17E1FF]/10 border-b-2 border-[#17E1FF]'
                      : isDarkMode
                        ? 'hover:bg-white/5'
                        : 'hover:bg-[#0B0E11]/5'
                  }`}
                >
                  <DocumentMagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="h-[calc(100%-40px)] overflow-auto">
                {activeBottomTab === 'output' && <OutputPanel projectId={currentProject._id} />}
                {activeBottomTab === 'review' && <ReviewPanel projectId={currentProject._id} />}
              </div>
            </div>
          </div>

          {/* Right: 30% - Chat (Scrollable) */}
          <div
            className={`w-[30%] rounded-xl  border border-white/10 overflow-hidden ${
              isDarkMode ? 'bg-white/5' : 'bg-white/60'
            }`}
          >
            <ChatSection projectId={currentProject._id} />
          </div>
        </motion.div>

        {/* Tablet Layout: 768px–1023px - Vertical Stack with Collapsible Chat */}
        <motion.div
          variants={itemVariants}
          className="hidden md:flex lg:hidden flex-col flex-1 gap-6 h-[calc(100vh-96px)] overflow-hidden"
        >
          {/* Code Editor - Top Priority */}
          <div
            className={`flex-1 rounded-3xl p-6 backdrop-blur-xl border border-white/10 overflow-hidden ${
              isDarkMode ? 'bg-white/5' : 'bg-white/60'
            }`}
          >
            <CodeEditor projectId={currentProject._id} />
          </div>

          {/* Output / Review Tabs - Fixed Height */}
          <div
            className={`h-64 rounded-3xl backdrop-blur-xl border border-white/10 overflow-hidden ${
              isDarkMode ? 'bg-white/5' : 'bg-white/60'
            }`}
          >
            {/* Tabs with Icons */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveBottomTab('output')}
                className={`flex-1 py-3 px-6 flex items-center justify-center transition-all ${
                  activeBottomTab === 'output'
                    ? 'bg-[#17E1FF]/10 border-b-2 border-[#17E1FF]'
                    : isDarkMode
                      ? 'hover:bg-white/5'
                      : 'hover:bg-[#0B0E11]/5'
                }`}
              >
                <CommandLineIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveBottomTab('review')}
                className={`flex-1 py-3 px-6 flex items-center justify-center transition-all ${
                  activeBottomTab === 'review'
                    ? 'bg-[#17E1FF]/10 border-b-2 border-[#17E1FF]'
                    : isDarkMode
                      ? 'hover:bg-white/5'
                      : 'hover:bg-[#0B0E11]/5'
                }`}
              >
                <DocumentMagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-40px)] overflow-auto">
              {activeBottomTab === 'output' && <OutputPanel projectId={currentProject._id} />}
              {activeBottomTab === 'review' && <ReviewPanel projectId={currentProject._id} />}
            </div>
          </div>

          {/* Chat Collapsible */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`py-3 px-6 rounded-t-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              isDarkMode
                ? 'bg-white/5 text-[#E6E8E5] hover:bg-white/10'
                : 'bg-[#0B0E11]/5 text-[#0B0E11] hover:bg-[#0B0E11]/10'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            {isChatOpen ? 'Collapse Chat' : 'Expand Chat'}
          </button>
          {isChatOpen && (
            <div
              className={`flex-1 rounded-b-3xl p-6 backdrop-blur-xl border border-white/10 overflow-hidden ${
                isDarkMode ? 'bg-white/5' : 'bg-white/60'
              }`}
            >
              <ChatSection projectId={currentProject._id} />
            </div>
          )}
        </motion.div>

        {/* Mobile Layout: ≤767px - Fullscreen Tabs */}
        <motion.div
          variants={itemVariants}
          className="flex md:hidden flex-col flex-1 gap-4 h-[calc(100vh-96px)] overflow-hidden"
        >
          {/* Tabs with Icons */}
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {[
              { id: 'code', icon: CodeBracketIcon },
              { id: 'chat', icon: ChatBubbleLeftRightIcon },
              { id: 'output', icon: CommandLineIcon },
              { id: 'review', icon: DocumentMagnifyingGlassIcon },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 min-w-[80px] py-2 px-4 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === id
                    ? 'bg-[#17E1FF]/10'
                    : isDarkMode
                      ? 'bg-white/5 hover:bg-white/10'
                      : 'bg-[#0B0E11]/5 hover:bg-[#0B0E11]/10'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Content - Full Screen */}
          <div
            className={`flex-1 rounded-xl backdrop-blur-xl border border-white/10 overflow-auto ${
              isDarkMode ? 'bg-white/5' : 'bg-white/60'
            }`}
          >
            {activeTab === 'code' && <CodeEditor projectId={currentProject._id} />}
            {activeTab === 'chat' && <ChatSection projectId={currentProject._id} />}
            {activeTab === 'output' && <OutputPanel projectId={currentProject._id} />}
            {activeTab === 'review' && <ReviewPanel projectId={currentProject._id} />}
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Project;
