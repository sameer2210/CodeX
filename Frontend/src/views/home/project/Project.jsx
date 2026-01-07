import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  clearProjectData,
  fetchProject,
  setCurrentProject,
} from '../../../store/slices/projectSlice';
import { addToast } from '../../../store/slices/uiSlice';
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
