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
import ReviewPanel from './components/ReviewPanel';

const Project = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Selectors
  const currentProject = useAppSelector(state => state.projects.currentProject);
  const isLoading = useAppSelector(state => state.projects.isLoading);
  const socketConnected = useAppSelector(state => state.socket.connected);
  const { isDarkMode, toggleTheme } = useTheme();

  // Local state
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'review' | 'chat' for mobile
  const [leftWidth, setLeftWidth] = useState(66.67); // Percentage for left panel (initial 2/3)
  const [containerHeight, setContainerHeight] = useState(window.innerHeight - 180); // Initial height
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);

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
        // dispatch({
        //   type: 'socket/leaveProject',
        //   payload: { projectId },
        // });
        dispatch(clearProjectData({ projectId }));
      }
    };
  }, [projectId, dispatch, navigate]);

  /* ========== SOCKET PROJECT ROOM ========== */

  // useEffect(() => {
  //   if (currentProject?._id && socketConnected) {
  //     // Join project room
  //     dispatch({
  //       type: 'socket/joinProject',
  //       payload: { projectId: currentProject._id },
  //     });

  //     console.log('🔌 Joined project room:', currentProject._id);
  //     notify({ message: 'Joined project collaboration room', type: 'info' });
  //   }

  //   return () => {
  //     if (currentProject?._id && socketConnected) {
  //       dispatch({
  //         type: 'socket/leaveProject',
  //         payload: { projectId: currentProject._id },
  //       });
  //       console.log('🔌 Left project room:', currentProject._id);
  //       notify({ message: 'Left project collaboration room', type: 'info' });
  //     }
  //   };
  // }, [currentProject?._id, socketConnected, dispatch]);

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


  /* ========== RESIZING HANDLERS ========== */

  const startHorizontalResizing = e => {
    e.preventDefault();
    setIsResizingHorizontal(true);
  };

  const startVerticalResizing = e => {
    e.preventDefault();
    setIsResizingVertical(true);
  };

  useEffect(() => {
    const handleMouseMove = e => {
      if (isResizingHorizontal) {
        const container = document.querySelector('.resize-container');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
        if (newLeftWidth >= 20 && newLeftWidth <= 80) {
          setLeftWidth(newLeftWidth);
        }
      } else if (isResizingVertical) {
        const container = document.querySelector('.resize-container');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const newHeight = e.clientY - rect.top;
        if (newHeight >= 200 && newHeight <= window.innerHeight - 100) {
          setContainerHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingHorizontal(false);
      setIsResizingVertical(false);
    };

    if (isResizingHorizontal || isResizingVertical) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingHorizontal, isResizingVertical]);

  /* ========== LOADING STATE ========== */

  if (isLoading || !currentProject) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  /* ========== RENDER ========== */

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-6 ">
        {/* Desktop Layout: Side-by-side with resizer */}
        <div
          className="hidden md:flex flex-col gap-0 overflow-hidden resize-container"
          style={{ height: `${containerHeight}px` }}
        >
          <div className="flex flex-1 gap-0 overflow-hidden">
            {/* Left: Code Editor & Review */}
            <div className="flex flex-col min-h-0" style={{ width: `${leftWidth}%` }}>
              {/* Tabs */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'code'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Code Editor
                </button>
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'review'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  AI Review
                </button>
              </div>

              {/* Content */}
              {activeTab === 'code' && (
                <motion.div
                  key={`code-${currentProject._id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full overflow-auto"
                >
                  <CodeEditor projectId={currentProject._id} />
                </motion.div>
              )}

              {activeTab === 'review' && (
                <motion.div
                  key={`review-${currentProject._id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full overflow-auto"
                >
                  <ReviewPanel projectId={currentProject._id} />
                </motion.div>
              )}
            </div>

            {/* Horizontal Resizer */}
            <div
              className={`w-2 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors ${
                isResizingHorizontal ? 'bg-blue-500' : ''
              }`}
              onMouseDown={startHorizontalResizing}
            ></div>

            {/* Right: Chat Section */}
            <div className="flex-1 min-h-0 overflow-auto">
              <ChatSection projectId={currentProject._id} />
            </div>
          </div>

          {/* Vertical Resizer */}
          <div
            className={`h-2 bg-gray-300 hover:bg-blue-500 cursor-row-resize transition-colors ${
              isResizingVertical ? 'bg-blue-500' : ''
            }`}
            onMouseDown={startVerticalResizing}
          ></div>
        </div>

        {/* Mobile Layout: Stacked with tabs and vertical resizing */}
        <div
          className="md:hidden flex flex-col gap-4 overflow-hidden"
          style={{ height: `${containerHeight}px` }}
        >
          {/* Mobile Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'review'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Review
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Chat
            </button>
          </div>

          {/* Mobile Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-auto"
          >
            {activeTab === 'code' && <CodeEditor projectId={currentProject._id} />}
            {activeTab === 'review' && <ReviewPanel projectId={currentProject._id} />}
            {activeTab === 'chat' && <ChatSection projectId={currentProject._id} />}
          </motion.div>

          {/* Vertical Resizer for Mobile */}
          <div
            className={`h-2 bg-gray-300 hover:bg-blue-500 cursor-row-resize transition-colors ${
              isResizingVertical ? 'bg-blue-500' : ''
            }`}
            onMouseDown={startVerticalResizing}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Project;
