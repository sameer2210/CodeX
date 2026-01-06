import { motion } from 'framer-motion';
import { ArrowLeft, Save, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchProject,
  setCurrentProject,
  clearProjectData,
} from '../../../store/slices/projectSlice';
import { addToast } from '../../../store/slices/uiSlice';
import Navigation from '../../../components/layout/Navigation';
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
  const isDarkMode = useAppSelector(state => state.ui.isDarkMode);

  // Local state
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'review'
  const [showChat, setShowChat] = useState(true);

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
      })
      .catch(error => {
        dispatch(
          addToast({
            message: error || 'Failed to load project',
            type: 'error',
          })
        );
        navigate('/');
      });

    // Cleanup on unmount
    return () => {
      if (projectId) {
        dispatch({
          type: 'socket/leaveProject',
          payload: { projectId },
        });
        dispatch(clearProjectData({ projectId }));
      }
    };
  }, [projectId, dispatch, navigate]);

  /* ========== SOCKET PROJECT ROOM ========== */

  useEffect(() => {
    if (currentProject?._id && socketConnected) {
      // Join project room
      dispatch({
        type: 'socket/joinProject',
        payload: { projectId: currentProject._id },
      });

      console.log('🔌 Joined project room:', currentProject._id);
    }

    return () => {
      if (currentProject?._id && socketConnected) {
        dispatch({
          type: 'socket/leaveProject',
          payload: { projectId: currentProject._id },
        });
        console.log('🔌 Left project room:', currentProject._id);
      }
    };
  }, [currentProject?._id, socketConnected, dispatch]);

  /* ========== HANDLERS ========== */

  const handleSaveProject = async () => {
    if (!currentProject) return;

    try {
      // Implement save logic here
      dispatch(
        addToast({
          message: 'Project saved successfully',
          type: 'success',
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          message: 'Failed to save project',
          type: 'error',
        })
      );
    }
  };

  const handleRunCode = () => {
    // Implement code execution logic
    dispatch(
      addToast({
        message: 'Code execution feature coming soon!',
        type: 'info',
      })
    );
  };

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
      <Navigation isDarkMode={isDarkMode} />

      {/* Project Header */}
      <div
        className={`sticky top-0 z-10 border-b ${
          isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
        } backdrop-blur-sm`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentProject.name}
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentProject.language || 'JavaScript'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    socketConnected ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {socketConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <button
                onClick={handleRunCode}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Run</span>
              </button>

              <button
                onClick={handleSaveProject}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 ">
        <div className="flex gap-6 h-[calc(100vh-180px)] overflow-hidden">
          {/* Left: Code Editor & Review (2 columns) */}
          <div className="flex-[2] flex flex-col min-h-0">
            {/* Tabs */}
            <div className="flex space-x-2">
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
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'code' ? (
                <CodeEditor projectId={currentProject._id} />
              ) : (
                <ReviewPanel projectId={currentProject._id} />
              )}
            </motion.div>
          </div>

          {/* Right: Chat Section (1 column) */}
          <div className="flex-[1] min-h-0">
            <ChatSection projectId={currentProject._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
