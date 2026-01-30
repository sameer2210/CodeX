import {
  ArrowRightStartOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CommandLineIcon,
  DocumentMagnifyingGlassIcon,
  HomeIcon,
  PhoneIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResizableContainer from '../../../components/ui/ResizableContainer';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

      {/* Sidebar + Main Content */}
      <div className="flex min-h-screen">
        {/* Sidebar - Icons Only, Visible on All Screens */}
        <div
          className={`w-16 flex flex-col items-center py-4 gap-6 border-r ${
            isDarkMode ? 'bg-[#0B0E11] border-white/10' : 'bg-[#E6E8E5] border-[#0B0E11]/10'
          }`}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <HomeIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`p-2 rounded-full transition-all ${
              activeTab === 'code' ? 'bg-[#17E1FF]/10' : 'hover:bg-white/10'
            }`}
          >
            <CodeBracketIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`p-2 rounded-full transition-all ${
              activeTab === 'output' ? 'bg-[#17E1FF]/10' : 'hover:bg-white/10'
            }`}
          >
            <CommandLineIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`p-2 rounded-full transition-all ${
              activeTab === 'review' ? 'bg-[#17E1FF]/10' : 'hover:bg-white/10'
            }`}
          >
            <DocumentMagnifyingGlassIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`p-2 rounded-full transition-all ${
              activeTab === 'chat' ? 'bg-[#17E1FF]/10' : 'hover:bg-white/10'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => notify('Audio call feature coming soon', 'info')}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <PhoneIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => notify('Video call feature coming soon', 'info')}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <VideoCameraIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-white/10 rounded-full transition-all mt-auto"
          >
            <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 p-1 sm:p-2 lg:p-4 min-h-screen relative z-10 flex flex-col"
        >
          {/* Desktop Layout: ≥1024px - Split View */}
          <motion.div
            variants={itemVariants}
            className="hidden lg:flex flex-row flex-1 h-full overflow-hidden gap-2"
          >
            {/* Left: Code Editor + Bottom Tabs (Output/Review) - 2/3 width */}
            <ResizableContainer minWidth={400} className="flex-[2]">
              <div className="flex flex-col gap-2 h-full">
                {/* Code Editor - Full Height Priority */}
                <ResizableContainer minHeight={300}>
                  <div
                    className={`h-full rounded-xl border-2 border-white/10 overflow-hidden ${
                      isDarkMode ? 'bg-white/5' : 'bg-white/60'
                    }`}
                  >
                    <CodeEditor projectId={currentProject._id} />
                  </div>
                </ResizableContainer>

                {/* Bottom: Output / Review Tabs - Fixed Height */}
                <ResizableContainer minHeight={100}>
                  <div
                    className={`h-full rounded-xl border border-white/10 overflow-hidden ${
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
                      {activeBottomTab === 'output' && (
                        <OutputPanel projectId={currentProject._id} />
                      )}
                      {activeBottomTab === 'review' && (
                        <ReviewPanel projectId={currentProject._id} />
                      )}
                    </div>
                  </div>
                </ResizableContainer>
              </div>
            </ResizableContainer>

            {/* Right: Chat (Scrollable) - 1/3 width */}
            <ResizableContainer minWidth={200} className="flex-[1]">
              <div
                className={`h-full rounded-xl border border-white/10 overflow-hidden ${
                  isDarkMode ? 'bg-white/5' : 'bg-white/60'
                }`}
              >
                <ChatSection projectId={currentProject._id} />
              </div>
            </ResizableContainer>
          </motion.div>

          {/* Tablet Layout: 768px–1023px - Vertical Stack with Collapsible Chat */}
          <motion.div
            variants={itemVariants}
            className="hidden md:flex lg:hidden flex-col flex-1 h-full overflow-hidden gap-2"
          >
            {/* Code Editor - Top Priority */}
            <ResizableContainer minHeight={300} className="flex-grow">
              <div
                className={`h-full rounded-3xl backdrop-blur-xl border border-white/10 overflow-hidden ${
                  isDarkMode ? 'bg-white/5' : 'bg-white/60'
                }`}
              >
                <CodeEditor projectId={currentProject._id} />
              </div>
            </ResizableContainer>

            {/* Output / Review Tabs - Fixed Height */}
            <ResizableContainer minHeight={100}>
              <div
                className={`h-full rounded-xl backdrop-blur-xl border border-white/10 overflow-hidden ${
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
            </ResizableContainer>

            {/* Chat Collapsible */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={` rounded-t-2xl flex items-center justify-center text-sm font-medium transition-all ${
                isDarkMode
                  ? 'bg-white/5 text-[#E6E8E5] hover:bg-white/10'
                  : 'bg-[#0B0E11]/5 text-[#0B0E11] hover:bg-[#0B0E11]/10'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              {isChatOpen ? 'Collapse Chat' : 'Expand Chat'}
            </button>
            {isChatOpen && (
              <ResizableContainer minHeight={200} className="flex-grow">
                <div
                  className={`h-full rounded-b-3xl backdrop-blur-xl border border-white/10 overflow-hidden ${
                    isDarkMode ? 'bg-white/5' : 'bg-white/60'
                  }`}
                >
                  <ChatSection projectId={currentProject._id} />
                </div>
              </ResizableContainer>
            )}
          </motion.div>

          {/* Mobile Layout: ≤767px - Sidebar + Content */}
          <motion.div
            variants={itemVariants}
            className="flex md:hidden flex-1 h-full overflow-hidden"
          >
            {/* Content - Full Screen */}
            <div className="flex-1 h-full">
              <div
                className={`h-full rounded-xl backdrop-blur-xl border border-white/10 overflow-hidden ${
                  isDarkMode ? 'bg-white/5' : 'bg-white/60'
                }`}
              >
                {activeTab === 'code' && <CodeEditor projectId={currentProject._id} />}
                {activeTab === 'chat' && <ChatSection projectId={currentProject._id} />}
                {activeTab === 'output' && <OutputPanel projectId={currentProject._id} />}
                {activeTab === 'review' && <ReviewPanel projectId={currentProject._id} />}
              </div>
            </div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default Project;
