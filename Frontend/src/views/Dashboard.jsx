import {
  ArrowUpRightIcon,
  BellIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SunIcon,
  VideoCameraIcon,
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

  // Fetch dashboard data on mount
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Socket initialization
  useEffect(() => {
    if (isAuthenticated) {
      dispatch({ type: 'socket/init' });
    }
  }, [isAuthenticated, dispatch]);

  // Timer logic
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

  // Chart data
  const weeklyData = [
    { name: 'S', value: 30 },
    { name: 'M', value: 45 },
    { name: 'T', value: 38 },
    { name: 'W', value: 65 },
    { name: 'T', value: 40 },
    { name: 'F', value: 35 },
    { name: 'S', value: 42 },
  ];

  const pieData = [
    { name: 'Completed', value: 41, color: '#10120F' },
    { name: 'In Progress', value: 35, color: '#5a6152' },
    { name: 'Pending', value: 24, color: '#C2CABB' },
  ];

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // Animation variants
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
      transition: { type: 'spring', stiffness: 80, damping: 15 },
    },
  };

  // Custom tooltip for bar chart with gradient
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#10120F] text-white px-4 py-2 rounded-xl shadow-2xl border border-[#C2CABB]/20">
          <p className="font-bold text-sm">{payload[0].value} hours</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${
        isDarkMode ? 'bg-[#10120F] text-[#C2CABB]' : 'bg-[#C2CABB] text-[#10120F]'
      }`}
    >
      {/* Sidebar */}
      <div
        className={`hidden lg:block transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } fixed inset-y-0 left-0 z-40 overflow-y-auto`}
      >
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <main
        className={`transition-all duration-500 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        } p-4 sm:p-6 lg:p-12 min-h-screen`}
      >
        {/* Header */}
        <header className="mb-12 lg:mb-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8 lg:mb-12">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl group">
              <MagnifyingGlassIcon
                className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  isDarkMode
                    ? 'text-[#C2CABB]/40 group-focus-within:text-[#C2CABB]'
                    : 'text-[#10120F]/40 group-focus-within:text-[#10120F]'
                }`}
              />
              <input
                type="text"
                placeholder="Search projects, tasks, people..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-14 pr-6 py-4 rounded-3xl text-sm font-medium outline-none transition-all ${
                  isDarkMode
                    ? 'bg-[#1a1c19] text-[#C2CABB] placeholder-[#C2CABB]/30 focus:bg-[#222420]'
                    : 'bg-white/60 text-[#10120F] placeholder-[#10120F]/30 focus:bg-white'
                }`}
              />
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <button
                className={`relative p-3 rounded-2xl transition-all ${
                  isDarkMode ? 'hover:bg-[#1a1c19]' : 'hover:bg-white/60'
                }`}
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-2xl transition-all ${
                  isDarkMode ? 'hover:bg-[#1a1c19]' : 'hover:bg-white/60'
                }`}
              >
                {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              </button>
              <div
                className={`flex items-center gap-3 pl-4 ml-4 border-l ${
                  isDarkMode ? 'border-[#C2CABB]/20' : 'border-[#10120F]/20'
                }`}
              >
                <img
                  src={user?.avatar || 'https://i.pravatar.cc/150?img=12'}
                  alt="Profile"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-offset-2 ring-offset-transparent ring-[#10120F]/10"
                />
                <div className="hidden lg:block">
                  <p className="text-sm font-bold">{user?.username || 'Guest User'}</p>
                  <p
                    className={`text-xs ${isDarkMode ? 'text-[#C2CABB]/50' : 'text-[#10120F]/50'}`}
                  >
                    {user?.email || 'guest@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Page Title */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 tracking-tighter leading-none"
              >
                Dashboard
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`text-base sm:text-lg lg:text-xl font-light ${
                  isDarkMode ? 'text-[#C2CABB]/60' : 'text-[#10120F]/60'
                }`}
              >
                Orchestrate your projects with precision
              </motion.p>
            </div>
            <div className="flex gap-3">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/create-project')}
                className="px-6 lg:px-8 py-3 lg:py-4 bg-[#10120F] text-[#C2CABB] rounded-3xl font-bold hover:scale-105 transition-transform flex items-center gap-2 text-sm lg:text-base"
              >
                <PlusIcon className="w-5 h-5" /> New Project
              </motion.button>
            </div>
          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 lg:space-y-8"
        >
          {/* KPI Grid - Swiss Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden group ${
                isDarkMode ? 'bg-[#10120F]' : 'bg-[#10120F]'
              } text-[#C2CABB]`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2CABB]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-xs lg:text-sm font-light mb-2 opacity-60 uppercase tracking-widest">
                Total
              </p>
              <h2 className="text-4xl lg:text-6xl font-bold mb-4 lg:mb-6">
                {stats?.totalProjects || 0}
              </h2>
              <div className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-[#C2CABB]/10">
                <span className="text-xs font-medium">↑ 12% growth</span>
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
                className={`rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 relative group hover:scale-[1.02] transition-all duration-300 ${
                  isDarkMode ? 'bg-[#1a1c19]' : 'bg-white/60'
                }`}
              >
                <p
                  className={`text-xs lg:text-sm font-light mb-2 uppercase tracking-widest ${
                    isDarkMode ? 'opacity-50' : 'opacity-40'
                  }`}
                >
                  {card.label}
                </p>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">{card.value}</h2>
                <span
                  className={`text-xs font-medium ${
                    isDarkMode ? 'text-[#C2CABB]/60' : 'text-[#10120F]/60'
                  }`}
                >
                  {card.trend}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Main Grid - Asymmetric Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Recent Projects - Large Feature */}
            <motion.div
              variants={itemVariants}
              className={`lg:col-span-8 rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 ${
                isDarkMode ? 'bg-[#1a1c19]' : 'bg-white/60'
              }`}
            >
              <div className="flex justify-between items-center mb-6 lg:mb-10">
                <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">Recent Projects</h3>
                <button
                  className={`px-4 lg:px-5 py-2 rounded-2xl font-semibold text-xs lg:text-sm ${
                    isDarkMode ? 'bg-[#C2CABB]/10 text-[#C2CABB]' : 'bg-[#10120F]/5 text-[#10120F]'
                  }`}
                >
                  View All
                </button>
              </div>
              <div className="space-y-3 lg:space-y-4">
                {(projects || []).slice(0, 4).map((proj, i) => (
                  <motion.div
                    key={proj._id || i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/project/${proj._id}`)}
                    className={`group flex items-center justify-between p-4 lg:p-6 rounded-2xl lg:rounded-3xl transition-all cursor-pointer ${
                      isDarkMode ? 'hover:bg-[#222420]' : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 lg:gap-5">
                      <div
                        className={`w-12 lg:w-14 h-12 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all ${
                          isDarkMode
                            ? 'bg-[#C2CABB]/10 group-hover:bg-[#10120F]'
                            : 'bg-[#10120F]/5 group-hover:bg-[#10120F]'
                        }`}
                      >
                        <FolderIcon
                          className={`w-6 lg:w-7 h-6 lg:h-7 transition-colors ${
                            isDarkMode
                              ? 'text-[#C2CABB] group-hover:text-[#C2CABB]'
                              : 'text-[#10120F] group-hover:text-[#C2CABB]'
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="text-base lg:text-lg font-bold mb-1">
                          {proj.name || 'Untitled Project'}
                        </h4>
                        <p
                          className={`text-xs lg:text-sm ${
                            isDarkMode ? 'text-[#C2CABB]/50' : 'text-[#10120F]/50'
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
                    <ArrowUpRightIcon className="w-5 lg:w-6 h-5 lg:h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Active Team Members */}
            <motion.div
              variants={itemVariants}
              className={`lg:col-span-4 rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 ${
                isDarkMode ? 'bg-[#1a1c19]' : 'bg-white/60'
              }`}
            >
              <h3 className="text-xl lg:text-2xl font-bold mb-6 lg:mb-8 tracking-tight">
                Active Team
              </h3>
              <div className="space-y-4 lg:space-y-6">
                {(teamMembers || []).slice(0, 5).map((member, i) => (
                  <motion.div
                    key={member._id || i}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 lg:gap-4"
                  >
                    <div className="relative">
                      <img
                        src={
                          member.avatar ||
                          `https://ui-avatars.com/api/?name=${member.username}&background=random`
                        }
                        alt={member.username}
                        className="w-11 lg:w-12 h-11 lg:h-12 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 lg:w-3.5 h-3 lg:h-3.5 rounded-full border-2 ${
                          isDarkMode ? 'border-[#1a1c19]' : 'border-white'
                        } ${member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}
                      ></span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{member.username}</p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? 'text-[#C2CABB]/50' : 'text-[#10120F]/50'
                        }`}
                      >
                        {member.status === 'online' ? 'Active now' : 'Away'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Analytics & Time Tracker Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Analytics - 2/3 width */}
            <motion.div
              variants={itemVariants}
              className={`lg:col-span-2 rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 ${
                isDarkMode ? 'bg-[#1a1c19]' : 'bg-white/60'
              }`}
            >
              <h3 className="text-xl lg:text-2xl font-bold mb-6 lg:mb-8 tracking-tight">
                Weekly Analytics
              </h3>
              <div className="h-60 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barSize={40}>
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
                <ResponsiveContainer width="100%" height="100%">
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
      </main>
    </div>
  );
};

export default Dashboard;
