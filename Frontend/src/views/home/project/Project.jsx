import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CommandLineIcon,
  DocumentMagnifyingGlassIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AudioCallPage, VideoCallPage } from '../../../components/CallingPage';
import ResizableContainer from '../../../components/ui/ResizableContainer';
import { useTheme } from '../../../context/ThemeContext';
import { notify } from '../../../lib/notify';
import { createRingtoneLoop, playHorn } from '../../../lib/sounds';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  CALL_STATUS,
  callAcceptRequested,
  callRejectRequested,
  callStartRequested,
} from '../../../store/slices/callSlice';
import {
  clearProjectData,
  fetchProject,
  selectCurrentProjectMessages,
  setCurrentProject,
} from '../../../store/slices/projectSlice';
import ChatSection from './components/ChatSection';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import ReviewPanel from './components/ReviewPanel';

const EASE = [0.22, 1, 0.36, 1];
const DEFAULT_EDITOR_SPLIT = 70;

const Project = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Selectors
  const currentProject = useAppSelector(state => state.projects.currentProject);
  const messages = useAppSelector(selectCurrentProjectMessages);
  const currentUser = useAppSelector(state => state.auth.user?.username);
  const isLoading = useAppSelector(state => state.projects.isLoading);
  const socketConnected = useAppSelector(state => state.socket.connected);
  const { isDarkMode } = useTheme();

  // Local state
  const [activeTab, setActiveTab] = useState('code'); // For mobile
  const [activeBottomTab, setActiveBottomTab] = useState('output'); // For output/review toggle
  const [isChatOpen, setIsChatOpen] = useState(true); // For tablet chat collapsible
  const call = useAppSelector(state => state.call);
  const splitRef = useRef(null);
  const [editorSplit, setEditorSplit] = useState(DEFAULT_EDITOR_SPLIT); // percent
  const dividerSize = 8; // px
  const ringtoneRef = useRef(null);
  const lastIncomingRef = useRef(false);
  const lastMessageCountRef = useRef(messages.length);
  const messageMountedRef = useRef(false);
  const getLayoutMode = () => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.innerWidth >= 1024) return 'desktop';
    if (window.innerWidth >= 768) return 'tablet';
    return 'mobile';
  };
  const [layoutMode, setLayoutMode] = useState(getLayoutMode);

  const clampEditorSplit = useCallback(() => {
    if (!splitRef.current) return;
    const containerHeight = splitRef.current.getBoundingClientRect().height - dividerSize;
    if (containerHeight <= 0) return;
    const minTop = Math.min(320, Math.max(220, containerHeight * 0.35));
    const minBottom = Math.min(160, Math.max(120, containerHeight * 0.22));
    const minPercent = (minTop / containerHeight) * 100;
    const maxPercent = 100 - (minBottom / containerHeight) * 100;
    setEditorSplit(prev => Math.min(Math.max(prev, minPercent), maxPercent));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setLayoutMode(prev => {
        const next = getLayoutMode();
        return prev === next ? prev : next;
      });
      if (layoutMode === 'desktop') {
        requestAnimationFrame(clampEditorSplit);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampEditorSplit, layoutMode]);

  useEffect(() => {
    if (layoutMode === 'desktop') {
      requestAnimationFrame(clampEditorSplit);
    }
  }, [layoutMode, clampEditorSplit]);

  useEffect(() => {
    ringtoneRef.current = createRingtoneLoop();
    return () => ringtoneRef.current?.stop();
  }, []);

  useEffect(() => {
    messageMountedRef.current = false;
    lastMessageCountRef.current = messages.length;
  }, [currentProject?._id]);

  useEffect(() => {
    if (!messageMountedRef.current) {
      messageMountedRef.current = true;
      lastMessageCountRef.current = messages.length;
      return;
    }

    if (messages.length <= lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
      return;
    }

    const newMessages = messages.slice(lastMessageCountRef.current);
    const hasIncoming = newMessages.some(
      msg => msg.type !== 'system' && msg.username && msg.username !== currentUser
    );

    if (hasIncoming) {
      playHorn();
    }

    lastMessageCountRef.current = messages.length;
  }, [messages, currentUser]);

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

  const isIncomingRinging = call.status === CALL_STATUS.RINGING && call.direction === 'incoming';
  const isCallActive = call.status === CALL_STATUS.CALLING || call.status === CALL_STATUS.ACCEPTED;

  useEffect(() => {
    if (!ringtoneRef.current) return;

    if (isIncomingRinging && !isCallActive) {
      ringtoneRef.current.start();
      if (!lastIncomingRef.current) {
        playHorn();
      }
      lastIncomingRef.current = true;
    } else {
      ringtoneRef.current.stop();
      lastIncomingRef.current = false;
    }
  }, [isIncomingRinging, isCallActive]);

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

  const mobileTab = activeTab === 'output' ? 'review' : activeTab;
  const mobileNavItems = [
    {
      key: 'logout',
      label: 'Logout',
      icon: ArrowLeftStartOnRectangleIcon,
      onClick: () => navigate('/login'),
      tone: 'danger',
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: ChatBubbleLeftRightIcon,
      onClick: () => setActiveTab('chat'),
    },
    {
      key: 'code',
      label: 'Code',
      icon: CodeBracketIcon,
      onClick: () => setActiveTab('code'),
    },
    {
      key: 'review',
      label: 'Review',
      icon: DocumentMagnifyingGlassIcon,
      onClick: () => setActiveTab('review'),
    },
  ];

  const startCall = (type, targetUser) => {
    if (!targetUser || targetUser === 'Team') {
      console.warn('Team calls not yet supported');
      return;
    }

    console.log(`Starting ${type} call with ${targetUser}`);
    dispatch(callStartRequested({ callee: targetUser, callType: type }));
  };

  const startGroupCall = (type, users) => {
    if (!Array.isArray(users) || users.length === 0) return;
    console.log(`Starting ${type} group call`);
    dispatch(callStartRequested({ callees: users, callType: type }));
  };

  const acceptIncomingCall = () => {
    if (!isIncomingRinging) return;
    console.log('Accepting incoming call');
    dispatch(callAcceptRequested());
  };

  const rejectIncomingCall = () => {
    if (!isIncomingRinging) return;
    console.log('Rejecting incoming call');
    dispatch(callRejectRequested());
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
        {/* Sidebar - Icons Only (Tablet/Desktop) */}
        <div
          className={`hidden md:flex w-16 flex-col items-center py-4 gap-6 border-r ${
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
          className={`flex-1 p-1 sm:p-2 lg:p-4 relative z-10 flex flex-col min-h-0 ${
            layoutMode === 'mobile'
              ? 'h-[100dvh] pb-[calc(72px+env(safe-area-inset-bottom))]'
              : 'min-h-screen'
          }`}
        >
          {/* Desktop Layout: ≥1024px - Split View */}
          {layoutMode === 'desktop' && (
            <motion.div
              variants={itemVariants}
              className="hidden lg:flex flex-row flex-1 h-full overflow-hidden gap-2"
            >
              {/* Left: Code Editor + Bottom Tabs (Output/Review) - 2/3 width */}
              <ResizableContainer minWidth={400} className="flex-[2]">
                <div
                  ref={splitRef}
                  className="grid h-full min-h-0"
                  style={{
                    gridTemplateRows: `${editorSplit}% ${dividerSize}px ${100 - editorSplit}%`,
                  }}
                >
                  {/* Code Editor - Full Height Priority */}
                  <div className="min-h-[300px]">
                    <div
                      className={`h-full rounded-xl border-2 border-white/10 overflow-hidden ${
                        isDarkMode ? 'bg-white/5' : 'bg-white/60'
                      }`}
                    >
                      <CodeEditor projectId={currentProject._id} />
                    </div>
                  </div>

                  <div
                    onMouseDown={e => {
                      e.preventDefault();
                      if (!splitRef.current) return;
                      const rect = splitRef.current.getBoundingClientRect();
                      const containerHeight = rect.height - dividerSize;
                      if (containerHeight <= 0) return;

                      const minTop = Math.min(320, Math.max(220, containerHeight * 0.35));
                      const minBottom = Math.min(160, Math.max(120, containerHeight * 0.22));
                      const minPercent = (minTop / containerHeight) * 100;
                      const maxPercent = 100 - (minBottom / containerHeight) * 100;

                      const onMouseMove = ev => {
                        const offset = ev.clientY - rect.top;
                        const nextPercent = (offset / containerHeight) * 100;
                        const clamped = Math.min(Math.max(nextPercent, minPercent), maxPercent);
                        setEditorSplit(clamped);
                      };

                      const stopResize = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', stopResize);
                      };

                      document.addEventListener('mousemove', onMouseMove);
                      document.addEventListener('mouseup', stopResize);
                    }}
                    onDoubleClick={() => setEditorSplit(DEFAULT_EDITOR_SPLIT)}
                    className="cursor-row-resize bg-white/10 hover:bg-[#17E1FF]/40 transition-colors rounded-md"
                    title="Drag to resize (double click to reset)"
                  />

                  {/* Bottom: Output / Review Tabs - Fixed Height */}
                  <div className="min-h-[120px]">
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
                  </div>
                </div>
              </ResizableContainer>

              {/* Right: Chat (Scrollable) - 1/3 width */}
              <ResizableContainer minWidth={200} className="flex-[1]">
                <div
                  className={`h-full rounded-xl border border-white/10 overflow-hidden ${
                    isDarkMode ? 'bg-white/5' : 'bg-white/60'
                  }`}
                >
                  <ChatSection
                    projectId={currentProject._id}
                    onStartCall={startCall}
                    onStartGroupCall={startGroupCall}
                  />
                </div>
              </ResizableContainer>
            </motion.div>
          )}

          {/* Tablet Layout: 768px–1023px - Vertical Stack with Collapsible Chat */}
          {layoutMode === 'tablet' && (
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
                    <ChatSection
                      projectId={currentProject._id}
                      onStartCall={startCall}
                      onStartGroupCall={startGroupCall}
                    />
                  </div>
                </ResizableContainer>
              )}
            </motion.div>
          )}

          {/* Mobile Layout: ≤767px - Sidebar + Content */}
          {layoutMode === 'mobile' && (
            <motion.div
              variants={itemVariants}
              className="flex md:hidden flex-1 min-h-0 overflow-hidden"
            >
              {/* Content - Full Screen */}
              <div className="flex-1 min-h-0">
                <div
                  className={`h-full rounded-xl backdrop-blur-xl border border-white/10 overflow-hidden ${
                    isDarkMode ? 'bg-white/5' : 'bg-white/60'
                  }`}
                >
                  {mobileTab === 'code' && <CodeEditor projectId={currentProject._id} />}
                  {mobileTab === 'chat' && (
                    <ChatSection
                      projectId={currentProject._id}
                      onStartCall={startCall}
                      onStartGroupCall={startGroupCall}
                    />
                  )}
                  {mobileTab === 'review' && <ReviewPanel projectId={currentProject._id} />}
                </div>
              </div>
            </motion.div>
          )}
        </motion.main>
      </div>

      {/* Incoming Call Banner */}
      <AnimatePresence>
        {isIncomingRinging && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-4 left-0 right-0 z-[60] flex justify-center px-3 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-[#111418]/90 backdrop-blur-xl border border-[#17E1FF]/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-[#17E1FF]/10 flex items-center justify-center animate-pulse">
                  {call.callType === 'audio' ? (
                    <Phone className="w-5 h-5 text-[#17E1FF]" />
                  ) : (
                    <Video className="w-5 h-5 text-[#17E1FF]" />
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{call.caller}</p>
                  <p className="text-xs text-[#17E1FF]">Incoming {call.callType} call...</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={rejectIncomingCall}
                  className="p-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  aria-label="Reject call"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
                <button
                  onClick={acceptIncomingCall}
                  className="p-2.5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all"
                  aria-label="Accept call"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {layoutMode === 'mobile' && (
        <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
          <div className="mx-auto w-full max-w-md px-2">
            <div
              className={`rounded-t-2xl border backdrop-blur-2xl px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_16px_40px_rgba(0,0,0,0.28)] ${
                isDarkMode
                  ? 'bg-[#0B0E11]/88 border-white/10'
                  : 'bg-white/88 border-[#0B0E11]/10 shadow-[0_16px_40px_rgba(15,15,15,0.12)]'
              }`}
            >
              <div className="grid grid-cols-4 gap-2">
                {mobileNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = item.key === mobileTab;
                  const isDanger = item.tone === 'danger';

                  return (
                    <button
                      key={item.key}
                      onClick={item.onClick}
                      className={`group relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all ${
                        isActive
                          ? ''
                          : isDanger
                            ? isDarkMode
                              ? 'text-red-400/70 hover:text-red-400'
                              : 'text-red-500/70 hover:text-red-500'
                            : isDarkMode
                              ? 'text-[#E6E8E5]/60 hover:text-[#E6E8E5]'
                              : 'text-[#0B0E11]/60 hover:text-[#0B0E11]'
                      }`}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="mobileNavActive"
                          className={`absolute inset-0 rounded-xl ${
                            isDarkMode ? 'bg-white/5' : 'bg-[#0B0E11]/5'
                          }`}
                        />
                      )}
                      {isActive && (
                        <motion.span
                          layoutId="mobileNavIndicator"
                          className="absolute -top-1.5 h-1 w-6 rounded-full bg-[#17E1FF]"
                        />
                      )}
                      <Icon className="w-6 h-6 relative z-10" />
                      <span
                        className={`relative z-10 text-[10px] font-semibold tracking-[0.14em] uppercase leading-none transition-all overflow-hidden ${
                          isActive ? 'max-h-4 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Call Page */}
      <AnimatePresence>
        {isCallActive && call.callType === 'audio' && <AudioCallPage />}
      </AnimatePresence>

      {/* Video Call Page */}
      <AnimatePresence>
        {isCallActive && call.callType === 'video' && <VideoCallPage />}
      </AnimatePresence>
    </div>
  );
};

export default Project;
