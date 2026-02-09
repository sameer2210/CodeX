import {
  ArrowUpRightIcon,
  Bars3Icon,
  BellIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SunIcon,
  VideoCameraIcon,
  // Zap,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { notify } from '../lib/notify';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboardData } from '../store/slices/projectSlice';

const EASE = [0.22, 1, 0.36, 1];

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, teamMembers, projects, isLoading } = useAppSelector(state => state.projects);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  const [timerActive, setTimerActive] = useState(false);
  const [time, setTime] = useState(5048);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(
    window.matchMedia('(min-width: 1024px)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const listener = () => setIsLargeScreen(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, []);

  useEffect(() => {
    if (isLargeScreen && isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [isLargeScreen, isMobileSidebarOpen]);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch({ type: 'socket/init' });
    }
    // return () => {
    //   dispatch({ type: 'socket/disconnect' });
    // };
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = seconds => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const weeklyData = [
    { name: 'Sun', value: 30 },
    { name: 'Mon', value: 45 },
    { name: 'Tue', value: 38 },
    { name: 'Wed', value: 65 },
    { name: 'Thu', value: 40 },
    { name: 'Fri', value: 35 },
    { name: 'Sat', value: 42 },
  ];

  const pieData = [
    { name: 'Completed', value: 41, color: '#17E1FF' },
    { name: 'In Progress', value: 35, color: '#0B0E11' },
    { name: 'Pending', value: 24, color: isDarkMode ? '#E6E8E5' : '#0B0E11' },
  ];

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const openMobileSidebar = () => setIsMobileSidebarOpen(true);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  const resolveMemberStatus = member => {
    if (!member) return 'offline';
    if (member.status) return member.status;
    if (typeof member.isActive === 'boolean') return member.isActive ? 'online' : 'offline';
    return 'offline';
  };

  const activeTeamMembers = (teamMembers || []).filter(member => {
    const status = resolveMemberStatus(member);
    return status === 'online' || status === 'active';
  });

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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`px-4 py-2 rounded-xl shadow-2xl border backdrop-blur-xl ${
            isDarkMode
              ? 'bg-[#0B0E11]/90 text-[#E6E8E5] border-[#17E1FF]/20'
              : 'bg-white/90 text-[#0B0E11] border-[#0B0E11]/10'
          }`}
        >
          <p className="font-bold text-sm">{payload[0].value} hours</p>
        </div>
      );
    }
    return null;
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

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          isMobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          onClick={closeMobileSidebar}
          className={`absolute inset-0 z-40 transition-opacity backdrop-blur-sm ${
            isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'
          } ${isDarkMode ? 'bg-[#0B0E11]/60' : 'bg-[#0B0E11]/40'}`}
        />
        <Sidebar
          isCollapsed={false}
          isMobile
          isOpen={isMobileSidebarOpen}
          onClose={closeMobileSidebar}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <motion.main
        animate={{
          marginLeft: isLargeScreen ? (isSidebarCollapsed ? 80 : 256) : 0,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 p-4 sm:p-6 lg:p-12 min-h-screen"
      >
        {/* Header */}
        <header className="mb-12 lg:mb-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8 lg:mb-12">
            {/* Search Bar with Glass Effect */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <motion.button
                onClick={openMobileSidebar}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`lg:hidden p-3 rounded-2xl transition-all backdrop-blur-xl border ${
                  isDarkMode
                    ? 'hover:bg-white/5 border-white/5'
                    : 'hover:bg-white/80 border-[#0B0E11]/5'
                }`}
                aria-label="Open sidebar"
              >
                <Bars3Icon className="w-6 h-6" />
              </motion.button>

              <div className="relative flex-1 group">
                <MagnifyingGlassIcon
                  className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                    isDarkMode
                      ? 'text-[#E6E8E5]/40 group-focus-within:text-[#17E1FF]'
                      : 'text-[#0B0E11]/40 group-focus-within:text-[#17E1FF]'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search projects, tasks, people..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full pl-14 pr-6 py-4 rounded-3xl text-sm font-medium outline-none transition-all backdrop-blur-xl border ${
                    isDarkMode
                      ? 'bg-white/5 text-[#E6E8E5] placeholder-[#E6E8E5]/30 border-white/10 focus:border-[#17E1FF]/30 focus:bg-white/10'
                      : 'bg-white/60 text-[#0B0E11] placeholder-[#0B0E11]/30 border-[#0B0E11]/5 focus:border-[#17E1FF]/30 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-3 rounded-2xl transition-all backdrop-blur-xl border ${
                  isDarkMode
                    ? 'hover:bg-white/5 border-white/5'
                    : 'hover:bg-white/80 border-[#0B0E11]/5'
                }`}
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#17E1FF] rounded-full animate-pulse" />
              </motion.button>

              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-2xl transition-all backdrop-blur-xl border ${
                  isDarkMode
                    ? 'hover:bg-white/5 border-white/5'
                    : 'hover:bg-white/80 border-[#0B0E11]/5'
                }`}
              >
                {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              </motion.button>

              <div
                className={`flex items-center gap-3 pl-4 ml-4 border-l ${
                  isDarkMode ? 'border-white/10' : 'border-[#0B0E11]/10'
                }`}
              >
                <img
                  src={user?.avatar || 'https://i.pravatar.cc/150?img=12'}
                  alt="Profile"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#17E1FF]/30"
                />
                <div className="hidden lg:block">
                  <p className="text-sm font-bold">{user?.username || 'Guest User'}</p>
                  <p
                    className={`text-xs ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}
                  >
                    {user?.email || 'guest@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Page Title - Kinetic Typography */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, letterSpacing: '0.2em' }}
                animate={{ opacity: 1, letterSpacing: '-0.04em' }}
                transition={{ duration: 1.2, ease: EASE }}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 tracking-tighter leading-none uppercase"
              >
                Dashboard
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className={`text-base sm:text-lg lg:text-xl font-light ${
                  isDarkMode ? 'text-[#E6E8E5]/40' : 'text-[#0B0E11]/40'
                }`}
              >
                High-performance workspace for distributed teams
              </motion.p>
            </div>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              onClick={() => navigate('/create-project')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#E6E8E5] text-[#0B0E11] rounded-2xl border font-black uppercase tracking-wide flex items-center gap-2 text-sm shadow-[0_0_40px_rgba(23,225,255,0.3)] transition-all"
            >
              <PlusIcon className="w-5 h-5" /> Initialize Project
            </motion.button>
          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 lg:space-y-8"
        >
          {/* KPI Grid - Glass Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: EASE } }}
              className={`rounded-3xl p-8 relative overflow-hidden group backdrop-blur-2xl border ${
                isDarkMode
                  ? 'bg-[#17E1FF]/10 border-[#17E1FF]/20'
                  : 'bg-[#17E1FF]/5 border-[#17E1FF]/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#17E1FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#17E1FF] rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-40 transition-opacity duration-700" />

              <div className="relative z-10">
                <p
                  className={`text-xs font-mono uppercase tracking-widest mb-2 ${
                    isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'
                  }`}
                >
                  Total Projects
                </p>
                <h2 className="text-6xl font-black mb-6">{stats?.totalProjects || 0}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#17E1FF]/20 backdrop-blur-sm">
                  {/* <Zap className="w-3 h-3 text-[#17E1FF]" /> */}
                  <span className="text-xs font-bold text-[#17E1FF]">+12%</span>
                </div>
              </div>
            </motion.div>

            {[
              { label: 'Completed', value: stats?.endedProjects || 0, trend: '+6%' },
              { label: 'Active', value: stats?.runningProjects || 0, trend: '+2%' },
              { label: 'Pending', value: stats?.pendingProjects || 0, trend: '—' },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: EASE } }}
                className={`rounded-3xl p-8 relative group backdrop-blur-2xl border transition-all ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-white/60 border-white/20 hover:border-[#0B0E11]/10'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10">
                  <p
                    className={`text-xs font-mono uppercase tracking-widest mb-2 ${
                      isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'
                    }`}
                  >
                    {card.label}
                  </p>
                  <h2 className="text-5xl font-black mb-6">{card.value}</h2>
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-[#E6E8E5]/60' : 'text-[#0B0E11]/60'
                    }`}
                  >
                    {card.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Projects */}
            <motion.div
              variants={itemVariants}
              className={`lg:col-span-8 rounded-3xl p-10 backdrop-blur-2xl border ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'
              }`}
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Recent Projects</h3>
                <button
                  className={`px-5 py-2 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all ${
                    isDarkMode
                      ? 'bg-white/5 text-[#E6E8E5] hover:bg-white/10'
                      : 'bg-[#0B0E11]/5 text-[#0B0E11] hover:bg-[#0B0E11]/10'
                  }`}
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {(projects || []).slice(0, 4).map((proj, i) => (
                  <motion.div
                    key={proj._id || i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1, ease: EASE }}
                    onClick={() => navigate(`/project/${proj._id}`)}
                    whileHover={{ x: 8 }}
                    className={`group flex items-center justify-between p-6 rounded-2xl transition-all cursor-pointer border ${
                      isDarkMode
                        ? 'hover:bg-white/5 border-transparent hover:border-[#17E1FF]/20'
                        : 'hover:bg-white border-transparent hover:border-[#0B0E11]/10'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                          isDarkMode
                            ? 'bg-[#17E1FF]/10 group-hover:bg-[#17E1FF]/20'
                            : 'bg-[#0B0E11]/5 group-hover:bg-[#0B0E11]/10'
                        }`}
                      >
                        <FolderIcon className="w-7 h-7 text-[#17E1FF]" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-1">
                          {proj.name || 'Untitled Project'}
                        </h4>
                        <p
                          className={`text-sm ${
                            isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'
                          }`}
                        >
                          Due:{' '}
                          {proj.createdAt
                            ? new Date(proj.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRightIcon className="w-6 h-6 opacity-0 group-hover:opacity-100 text-[#17E1FF] transition-all" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Active Team */}
            <motion.div
              variants={itemVariants}
              className={`lg:col-span-4 rounded-3xl p-10 backdrop-blur-2xl border ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'
              }`}
            >
              <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">Active Team</h3>
              <div className="space-y-6">
                {activeTeamMembers.length === 0 ? (
                  <p className={`text-sm ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}>
                    No active members right now.
                  </p>
                ) : (
                  activeTeamMembers.slice(0, 5).map((member, i) => {
                    const status = resolveMemberStatus(member);
                    const isOnline = status === 'online' || status === 'active';
                    const displayName = member.username || member.email || 'Unknown';

                    return (
                      <motion.div
                        key={member._id || member.username || i}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, ease: EASE }}
                        className="flex items-center gap-4"
                      >
                        <div className="relative">
                          <img
                            src={
                              member.avatar ||
                              `https://ui-avatars.com/api/?name=${displayName}&background=random`
                            }
                            alt={displayName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#17E1FF]/30"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                              isDarkMode ? 'border-[#0B0E11]' : 'border-white'
                            } ${isOnline ? 'bg-[#17E1FF]' : 'bg-yellow-500'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{displayName}</p>
                          <p
                            className={`text-xs ${
                              isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'
                            }`}
                          >
                            {isOnline ? 'Active now' : 'Away'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

          {/* Analytics & Timer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analytics with Gradient Bars */}
            <motion.div
              variants={itemVariants}
              className={`lg:col-span-2 rounded-3xl p-10 backdrop-blur-2xl border ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'
              }`}
            >
              <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">
                Weekly Analytics
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                  <BarChart data={weeklyData} barSize={50}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10120F" stopOpacity={1} />
                        <stop offset="100%" stopColor="#5a6152" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar dataKey="value" radius={[20, 20, 0, 0]} fill="url(#barGradient)">
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          className="transition-opacity hover:opacity-70"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                className={`flex justify-between px-4 lg:px-8 mt-4 text-xs lg:text-sm font-medium ${
                  isDarkMode ? 'text-[#C2CABB]/50' : 'text-[#10120F]/50'
                }`}
              >
                {weeklyData.map(d => (
                  <span key={d.name}>{d.name}</span>
                ))}
              </div>
            </motion.div>

            {/* Time Tracker */}
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#10120F]' : 'bg-[#10120F]'
              } text-[#C2CABB]`}
            >
              <div>
                <h3 className="text-sm lg:text-lg font-light mb-8 lg:mb-10 opacity-60 uppercase tracking-widest">
                  Time Tracker
                </h3>
                <div className="text-center mb-8 lg:mb-12">
                  <h2 className="text-4xl lg:text-5xl font-mono font-bold tracking-wider">
                    {formatTime(time)}
                  </h2>
                </div>
              </div>

              <div className="flex justify-center gap-3 lg:gap-4">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="w-14 lg:w-16 h-14 lg:h-16 rounded-full bg-[#C2CABB] text-[#10120F] flex items-center justify-center hover:scale-110 transition-transform"
                >
                  {timerActive ? (
                    <PauseIcon className="w-5 lg:w-6 h-5 lg:h-6" />
                  ) : (
                    <PlayIcon className="w-5 lg:w-6 h-5 lg:h-6 ml-1" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTime(0);
                  }}
                  className="w-14 lg:w-16 h-14 lg:h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <div className="w-4 lg:w-5 h-4 lg:h-5 bg-current rounded-sm"></div>
                </button>
              </div>
            </motion.div>
          </div>
          {/* Project Progress & Reminder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Project Progress */}
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 ${
                isDarkMode ? 'bg-[#1a1c19]' : 'bg-white/60'
              }`}
            >
              <div className="w-full lg:w-auto">
                <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 tracking-tight">
                  Progress Overview
                </h3>
                <div className="space-y-3 lg:space-y-4">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="w-3 lg:w-4 h-3 lg:h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <span className="font-medium text-sm lg:text-base">{item.name}</span>
                      <span
                        className={`ml-auto font-bold text-sm lg:text-base ${
                          isDarkMode ? 'text-[#C2CABB]/60' : 'text-[#10120F]/60'
                        }`}
                      >
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative w-40 h-40 lg:w-48 lg:h-48">
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={75}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={3}
                      dataKey="value"
                      cornerRadius={8}
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <h2 className="text-3xl lg:text-4xl font-bold">41%</h2>
                  <p
                    className={`text-xs font-medium uppercase tracking-wide ${
                      isDarkMode ? 'text-[#C2CABB]/50' : 'text-[#10120F]/50'
                    }`}
                  >
                    Done
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Reminder */}
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#1a1c19]' : 'bg-white/60'
              }`}
            >
              <div>
                <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 tracking-tight">
                  Next Meeting
                </h3>
                <h4 className="text-lg lg:text-xl font-bold mb-2">Arc Company Review</h4>
                <p
                  className={`font-medium text-sm lg:text-base ${
                    isDarkMode ? 'text-[#C2CABB]/60' : 'text-[#10120F]/60'
                  }`}
                >
                  02:00 PM - 04:00 PM
                </p>
              </div>
              <button
                onClick={() => notify('Meeting started', 'success')}
                className="w-full py-4 lg:py-5 bg-[#10120F] text-[#C2CABB] rounded-2xl lg:rounded-3xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 text-sm lg:text-base mt-6"
              >
                <VideoCameraIcon className="w-5 lg:w-6 h-5 lg:h-6" />
                Join Meeting
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Dashboard;
