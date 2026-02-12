import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import ActiveMember from './ActiveMember';
import {
  clearProjectData,
  fetchDashboardData,
  fetchProject,
  setCurrentProject,
} from '../../store/slices/projectSlice';
import ChatSection from '../../views/home/project/components/ChatSection';

const Meeting = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { projectId: projectIdParam } = useParams();
  const dispatch = useAppDispatch();
  const { projects, currentProject, isLoading, lastDashboardFetchAt, lastDashboardErrorAt } =
    useAppSelector(state => state.projects);
  const socketConnected = useAppSelector(state => state.socket.connected);

  useEffect(() => {
    if (projects.length > 0 || isLoading) return;
    const now = Date.now();
    if (lastDashboardFetchAt && now - lastDashboardFetchAt < 15000) return;
    if (lastDashboardErrorAt && now - lastDashboardErrorAt < 15000) return;
    dispatch(fetchDashboardData());
  }, [projects.length, isLoading, lastDashboardFetchAt, lastDashboardErrorAt, dispatch]);

  useEffect(() => {
    if (!projectIdParam) return;
    if (currentProject?._id === projectIdParam) return;

    dispatch(fetchProject(projectIdParam))
      .unwrap()
      .then(project => {
        dispatch(setCurrentProject(project));
      })
      .catch(() => {
        navigate('/dashboard');
      });
  }, [projectIdParam, currentProject?._id, dispatch, navigate]);

  useEffect(() => {
    if (projectIdParam) return;
    const fallbackProject = currentProject || projects[0];
    if (!fallbackProject?._id) return;
    dispatch(setCurrentProject(fallbackProject));
    navigate(`/meeting/${fallbackProject._id}`, { replace: true });
  }, [projectIdParam, currentProject, projects, dispatch, navigate]);

  const activeProjectId = currentProject?._id;
  const activeProjectName = useMemo(() => {
    if (currentProject?.name) return currentProject.name;
    return 'Project Chat';
  }, [currentProject]);

  useEffect(() => {
    if (!socketConnected || !activeProjectId) return;
    dispatch({ type: 'socket/joinProject', payload: { projectId: activeProjectId } });

    return () => {
      dispatch({ type: 'socket/leaveProject', payload: { projectId: activeProjectId } });
    };
  }, [socketConnected, activeProjectId, dispatch]);

  useEffect(() => {
    return () => {
      if (activeProjectId) {
        dispatch(clearProjectData({ projectId: activeProjectId }));
      }
    };
  }, [activeProjectId, dispatch]);

  if (isLoading && !activeProjectId) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-[#0B0E11]' : 'bg-[#E6E8E5]'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#17E1FF] border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}>
            Loading meeting...
          </p>
        </div>
      </div>
    );
  }

  if (!activeProjectId) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-[#0B0E11] text-[#E6E8E5]' : 'bg-[#E6E8E5] text-[#0B0E11]'
        }`}
      >
        <div
          className={`max-w-md text-center rounded-3xl border p-8 ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/10'
          }`}
        >
          <h2 className="text-2xl font-bold mb-3">No projects available</h2>
          <p className={`text-sm ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}>
            Create a project first to start a meeting chat.
          </p>
          <button
            onClick={() => navigate('/create-project')}
            className="mt-6 px-6 py-3 rounded-2xl bg-[#17E1FF] text-[#0B0E11] font-semibold"
          >
            Create Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-[100dvh] font-sans transition-colors duration-500 relative overflow-hidden ${
        isDarkMode ? 'bg-[#0B0E11] text-[#E6E8E5]' : 'bg-[#E6E8E5] text-[#0B0E11]'
      }`}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />
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
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#17E1FF]/10 rounded-full blur-[200px] opacity-30 pointer-events-none z-[1]" />

      <div className="relative z-10 flex flex-col h-full min-h-0">
        <header className="hidden lg:flex px-4 sm:px-6 lg:px-10 py-6 flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#17E1FF]">Meeting Room</p>
            <h1 className="text-xl sm:text-xl lg:text-xl font-black tracking-tight">
              {activeProjectName}
            </h1>
            <p
              className={`mt-2 text-sm sm:text-base ${
                isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'
              }`}
            >
              Team chat powered by your project room.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className={`px-5 py-3 rounded-2xl font-semibold text-sm uppercase tracking-wide border transition-all ${
              isDarkMode
                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                : 'bg-white/60 border-black/10 hover:bg-white'
            }`}
          >
            Back to Dashboard
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 min-h-0 px-0 sm:px-6 lg:px-10 pb-0 lg:pb-6 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 h-full min-h-0 overflow-hidden">
            <div
              className={`h-full min-h-0 rounded-3xl border backdrop-blur-2xl overflow-hidden ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/10'
              }`}
            >
              <ChatSection projectId={activeProjectId} />
            </div>
            <div className="min-h-0 overflow-hidden hidden lg:block">
              <ActiveMember title="Team Presence" className="h-full min-h-0 p-6" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Meeting;
