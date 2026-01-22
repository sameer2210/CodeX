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
  const [time, setTime] = useState(5048); // 01:24:08 in seconds
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

  /* Mock Data for Charts */
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
    { name: 'Completed', value: 41, color: '#144d36' },
    { name: 'In Progress', value: 35, color: '#2a6f52' },
    { name: 'Pending', value: 24, color: '#e5e7eb' },
  ];
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  /* Animation Variants */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div
      className={`min-h-screen font-sans text-[#10120F] ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#F8F9FA]'}`}
    >
      {/* <Sidebar /> */}
      <div
        className={`hidden lg:block transition-all duration-300 ${
          isSidebarCollapsed ? 'w-4' : 'w-4'
        } fixed inset-y-0 left-0 z-40 overflow-y-auto`}
      >
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
      </div>
      {/* Main Content Area */}
      <main className={`ml-64 p-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#F8F9FA]'}`}>
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="relative w-96 group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#144d36] transition-colors" />
            <input
              type="text"
              placeholder="Search task"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm font-medium shadow-sm outline-none border border-transparent focus:border-[#144d36]/20 transition-all placeholder-gray-400 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md font-bold">
                ⌘ F
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-600">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F8F9FA]"></span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-600"
            >
              {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img
                  src={user?.avatar || 'https://picsum.photos/200'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-[#10120F]">{user?.username || 'Guest User'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'guest@example.com'}</p>
              </div>
            </div>
          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Dashboard Title & Actions */}
          <div className="flex justify-between items-end">
            <div>
              <h1
                className={`text-4xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}
              >
                Dashboard
              </h1>
              <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Plan, prioritize, and accomplish your tasks with ease.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/create-project')}
                className={`px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-[#144d36]/20 hover:bg-[#0f3b2a] transition-all flex items-center gap-2 ${isDarkMode ? 'bg-[#144d36] text-white' : 'bg-[#144d36] text-white'}`}
              >
                <PlusIcon className="w-5 h-5" /> Add Project
              </button>
              <button
                className={`px-6 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border border-gray-200 text-[#10120F]'}`}
              >
                Import Data
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Projects - Hero Card */}
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-[#144d36]/20 group ${isDarkMode ? 'bg-[#144d36]' : 'bg-[#144d36]'}`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md cursor-pointer">
                  <ArrowUpRightIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-emerald-100 font-medium mb-1">Total Projects</p>
              <h2 className="text-5xl font-bold mb-8">{stats.totalProjects}</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
                <span className="w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center text-[10px] text-[#144d36] font-bold">
                  ↑
                </span>
                <span className="text-sm font-medium text-emerald-100">
                  Increased from last month
                </span>
              </div>
            </motion.div>

            {/* Other KPI Cards */}
            {[
              {
                label: 'Ended Projects',
                value: stats.endedProjects,
                trend: 6,
                color: isDarkMode ? 'text-white' : 'text-[#10120F]',
              },
              {
                label: 'Running Projects',
                value: stats.runningProjects,
                trend: 2,
                color: isDarkMode ? 'text-white' : 'text-[#10120F]',
              },
              {
                label: 'Pending Project',
                value: stats.pendingProjects,
                trend: 0,
                sub: 'On Discuss',
                color: isDarkMode ? 'text-white' : 'text-[#10120F]',
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`rounded-[2rem] p-6 relative group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100/50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="absolute top-0 right-0 p-6">
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-[#144d36] group-hover:border-transparent transition-all cursor-pointer">
                    <ArrowUpRightIcon
                      className={`w-5 h-5 ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-400 group-hover:text-white'}`}
                    />
                  </div>
                </div>
                <p className={`font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {card.label}
                </p>
                <h2 className={`text-5xl font-bold mb-8 ${card.color}`}>{card.value}</h2>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  {card.trend > 0 ? (
                    <>
                      <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-600 font-bold">
                        ↑
                      </span>
                      <span
                        className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        Increased from last month
                      </span>
                    </>
                  ) : (
                    <span
                      className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {card.sub}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Middle Row: Team, Progress, Projects, Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Recent Projects */}
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] p-6 border border-gray-100/50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}>
                  Projects
                </h3>
                <button
                  onClick={() => navigate('/create-project')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg text-gray-600 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  + New
                </button>
              </div>
              <div className="space-y-4">
                {projects.slice(0, 3).map((proj, i) => (
                  <div
                    key={proj._id || i}
                    onClick={() => navigate(`/project/${proj._id}`)}
                    className={`group flex items-center gap-4 p-3 rounded-2xl transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#F8F9FA]'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:text-white transition-colors ${isDarkMode ? 'bg-blue-900 text-blue-300 group-hover:bg-[#144d36]' : 'bg-blue-50 text-blue-600 group-hover:bg-[#144d36]'}`}
                    >
                      <FolderIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}
                      >
                        {proj.name || 'Untitled Project'}
                      </h4>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                        Due:{' '}
                        {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Team Collaboration */}
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] p-6 border border-gray-100/50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}>
                  Team Collaboration
                </h3>
                <button
                  className={`text-sm font-semibold border rounded-lg px-3 py-1 hover:bg-gray-50 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                >
                  + Add
                </button>
              </div>
              <div className="space-y-5">
                {teamMembers.slice(0, 3).map(member => (
                  <div key={member._id} className="flex items-start gap-3">
                    <img
                      src={
                        member.avatar ||
                        `https://ui-avatars.com/api/?name=${member.username}&background=random`
                      }
                      alt={member.username}
                      className="w-10 h-10 rounded-full border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}
                      >
                        {member.username}
                      </p>
                      <p
                        className={`text-xs truncate mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}
                      >
                        Working on{' '}
                        <span
                          className={`font-medium ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}
                        >
                          Project X
                        </span>
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                        member.status === 'online'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {member.status === 'online' ? 'Active' : 'Away'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Project Progress (Pie) */}
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] p-6 border border-gray-100/50 flex flex-col items-center justify-center relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="absolute top-6 left-6">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}>
                  Project Progress
                </h3>
              </div>
              <div className="relative w-48 h-48 mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={5}
                      dataKey="value"
                      cornerRadius={10}
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <h2
                    className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}
                  >
                    41%
                  </h2>
                  <p
                    className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    Ended
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#144d36]"></span>
                  <span
                    className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Done
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2a6f52]"></span>
                  <span
                    className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Progress
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Time Tracker */}
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] p-6 text-white relative overflow-hidden flex flex-col justify-between ${isDarkMode ? 'bg-[#0f291e]' : 'bg-[#0f291e]'}`}
            >
              {/* Decorative waves */}
              <div className="absolute inset-0 opacity-20">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 100 C 20 0 50 0 100 100 Z" fill="#144d36" />
                  <path d="M0 100 C 30 20 70 20 100 100 Z" fill="#2a6f52" />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="text-sm font-medium text-gray-300 mb-6">Time Tracker</h3>
                <div className="text-center mb-6">
                  <h2 className="text-4xl font-mono font-bold tracking-wider">
                    {formatTime(time)}
                  </h2>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setTimerActive(!timerActive)}
                    className="w-12 h-12 rounded-full bg-white text-[#144d36] flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {timerActive ? (
                      <PauseIcon className="w-5 h-5 fill-current" />
                    ) : (
                      <PlayIcon className="w-5 h-5 fill-current ml-1" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setTimerActive(false);
                      setTime(0);
                    }}
                    className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row: Analytics & Reminders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analytics */}
            <motion.div
              variants={itemVariants}
              className={`lg:col-span-2 rounded-[2rem] p-8 border border-gray-100/50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}>
                  Project Analytics
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barSize={40}>
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar dataKey="value" radius={[20, 20, 20, 20]}>
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 3 ? '#144d36' : index === 2 ? '#66c09b' : '#E5E7EB'}
                          className="transition-all duration-300 hover:opacity-80"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                className={`flex justify-between px-4 mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
              >
                {weeklyData.map(d => (
                  <span key={d.name}>{d.name}</span>
                ))}
              </div>
            </motion.div>

            {/* Reminders */}
            <motion.div
              variants={itemVariants}
              className={`rounded-[2rem] p-8 border border-gray-100/50 flex flex-col justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div>
                <h3
                  className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}
                >
                  Reminders
                </h3>
                <div className="mb-2">
                  <h4
                    className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#10120F]'}`}
                  >
                    Meeting with Arc Company
                  </h4>
                  <p
                    className={`mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}
                  >
                    Time: 02:00 pm - 04:00 pm
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => notify('Meeting started', 'success')}
                  className={`w-full py-4 rounded-2xl font-bold text-lg hover:bg-[#0f3b2a] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#144d36]/20 ${isDarkMode ? 'bg-[#144d36] text-white' : 'bg-[#144d36] text-white'}`}
                >
                  <VideoCameraIcon className="w-6 h-6" />
                  Start Meeting
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
