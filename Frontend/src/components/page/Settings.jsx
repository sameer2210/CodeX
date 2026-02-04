import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  CreditCardIcon,
  KeyIcon,
  MoonIcon,
  PhotoIcon,
  ShieldCheckIcon,
  SunIcon,
  UserCircleIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import Sidebar from '../layout/Sidebar';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const EASE = [0.22, 1, 0.36, 1];

// Tab Configurations
const TABS = [
  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
  { id: 'team', label: 'Team', icon: UsersIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  { id: 'billing', label: 'Billing', icon: CreditCardIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
];

const Toggle = ({ enabled, onChange, isDarkMode }) => (
  <button
    onClick={onChange}
    className={`relative h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none ${
      enabled ? 'bg-[#17E1FF]' : isDarkMode ? 'bg-white/10' : 'bg-black/10'
    }`}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`block h-5 w-5 rounded-full bg-white shadow-md absolute top-1 left-1 ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(
    window.matchMedia('(min-width: 1024px)').matches
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { teamMembers, isLoading } = useAppSelector(state => state.projects);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Mock State for Forms
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@industry.inc',
    bio: 'Senior Systems Architect | Nexus Lead',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    slack: true,
    marketing: false,
  });

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.matchMedia('(min-width: 1024px)').matches);
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isLargeScreen && isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [isLargeScreen, isMobileSidebarOpen]);

  const resolveMemberStatus = member => {
    if (!member) return 'offline';
    if (member.status) return member.status;
    if (typeof member.isActive === 'boolean') return member.isActive ? 'online' : 'offline';
    return 'offline';
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 relative flex ${
        isDarkMode ? 'bg-[#0B0E11] text-[#E6E8E5]' : 'bg-[#E6E8E5] text-[#0B0E11]'
      }`}
    >
      {/* Background Effects (Matching Dashboard) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />
      <div
        className={`fixed inset-0 pointer-events-none z-[1] ${isDarkMode ? 'opacity-[0.02]' : 'opacity-[0.01]'}`}
        style={{
          backgroundImage: isDarkMode
            ? 'linear-gradient(#E6E8E5 1px, transparent 1px), linear-gradient(90deg, #E6E8E5 1px, transparent 1px)'
            : 'linear-gradient(#0B0E11 1px, transparent 1px), linear-gradient(90deg, #0B0E11 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          isMobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`absolute inset-0 z-40 transition-opacity backdrop-blur-sm ${
            isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'
          } ${isDarkMode ? 'bg-[#0B0E11]/60' : 'bg-[#0B0E11]/40'}`}
        />
        <Sidebar
          isCollapsed={false}
          isMobile
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <motion.main
        animate={{
          marginLeft: isLargeScreen ? (isSidebarCollapsed ? 80 : 256) : 0,
        }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative z-10 flex-1 p-4 sm:p-6 lg:p-12 min-h-screen flex flex-col min-w-0"
      >
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-3">
            <motion.button
              onClick={() => setIsMobileSidebarOpen(true)}
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
            <div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase mb-2">
                Settings
              </h1>
              <p
                className={`text-sm lg:text-base ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}
              >
                Manage your workspace preferences and team access.
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`px-6 py-3 rounded-xl border backdrop-blur-xl transition-all font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${
              isDarkMode
                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                : 'border-red-500/30 text-red-600 hover:bg-red-500/10'
            }`}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 flex-1 min-w-0">
          {/* Settings Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all whitespace-nowrap text-sm font-bold tracking-wide relative overflow-hidden group ${
                      isActive
                        ? isDarkMode
                          ? 'bg-white/10 text-[#17E1FF]'
                          : 'bg-white/80 text-[#17E1FF] shadow-lg'
                        : isDarkMode
                          ? 'text-[#E6E8E5]/40 hover:text-[#E6E8E5] hover:bg-white/5'
                          : 'text-[#0B0E11]/40 hover:text-[#0B0E11] hover:bg-white/40'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${isActive ? 'text-[#17E1FF]' : ''}`} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeSettingTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#17E1FF] rounded-r-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Settings Content Area */}
          <div className="flex-1 max-w-4xl relative min-h-[500px] min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  {/* Profile Header */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'}`}
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="relative group cursor-pointer">
                        <img
                          src=""
                          alt=""
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-[#17E1FF]/20"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PhotoIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-lg sm:text-xl font-bold">{profile.name}</h3>
                        <p
                          className={`text-xs sm:text-sm mb-4 ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}
                        >
                          {profile.email}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                          <button className="px-4 py-2 bg-[#17E1FF] text-[#0B0E11] text-xs font-bold uppercase rounded-lg hover:brightness-110 transition-all">
                            Change Avatar
                          </button>
                          <button
                            className={`px-4 py-2 border text-xs font-bold uppercase rounded-lg transition-all ${isDarkMode ? 'border-white/20 hover:bg-white/10' : 'border-[#0B0E11]/20 hover:bg-[#0B0E11]/5'}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl space-y-6 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={e => setProfile({ ...profile, name: e.target.value })}
                          className={`w-full px-5 py-4 rounded-xl outline-none transition-all ${isDarkMode ? 'bg-black/20 focus:bg-black/40 text-white border border-white/10 focus:border-[#17E1FF]/50' : 'bg-white/50 focus:bg-white border border-[#0B0E11]/10 focus:border-[#17E1FF]/50'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={e => setProfile({ ...profile, email: e.target.value })}
                          className={`w-full px-5 py-4 rounded-xl outline-none transition-all ${isDarkMode ? 'bg-black/20 focus:bg-black/40 text-white border border-white/10 focus:border-[#17E1FF]/50' : 'bg-white/50 focus:bg-white border border-[#0B0E11]/10 focus:border-[#17E1FF]/50'}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                        Bio
                      </label>
                      <textarea
                        rows={3}
                        value={profile.bio}
                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                        className={`w-full px-5 py-4 rounded-xl outline-none transition-all resize-none ${isDarkMode ? 'bg-black/20 focus:bg-black/40 text-white border border-white/10 focus:border-[#17E1FF]/50' : 'bg-white/50 focus:bg-white border border-[#0B0E11]/10 focus:border-[#17E1FF]/50'}`}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <button className="px-8 py-3 bg-[#17E1FF] text-[#0B0E11] font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(23,225,255,0.4)] transition-all">
                        Save Changes
                      </button>
                    </div>
                  </div>
                  {/* Appearance */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'}`}
                  >
                    <div>
                      <h3 className="font-bold text-lg mb-1">Appearance</h3>
                      <p
                        className={`text-sm ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}
                      >
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-[#17E1FF]' : 'bg-[#0B0E11] border-transparent text-[#17E1FF]'}`}
                    >
                      {isDarkMode ? (
                        <SunIcon className="w-6 h-6" />
                      ) : (
                        <MoonIcon className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'team' && (
                <motion.div
                  key="team"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-bold">Team Management</h3>
                      <p
                        className={`text-sm mt-1 ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}
                      >
                        Control access and roles for your workspace.
                      </p>
                    </div>
                    <button className="w-full sm:w-auto px-5 py-3 bg-[#E6E8E5] text-[#0B0E11] font-bold uppercase text-xs rounded-xl hover:scale-105 transition-transform flex items-center gap-2 justify-center">
                      <UserGroupIcon className="w-4 h-4" /> Invite Member
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(teamMembers || []).length === 0 ? (
                      <p
                        className={`text-sm ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}
                      >
                        {isLoading ? 'Loading team members…' : 'No team members found.'}
                      </p>
                    ) : (
                      (teamMembers || []).map(member => {
                        const memberName = member.name || member.username || 'Unknown';
                        const memberEmail = member.email || member.username || '—';
                        const memberRole = member.role || (member.isAdmin ? 'Admin' : 'Member');

                        return (
                      <div
                        key={member._id || member.id || member.username}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${isDarkMode ? 'bg-black/20 border-white/5 hover:border-[#17E1FF]/30' : 'bg-white/40 border-[#0B0E11]/5 hover:border-[#17E1FF]/30'}`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={`https://ui-avatars.com/api/?name=${memberName}&background=random`}
                            alt={memberName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-bold text-sm">{memberName}</p>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}
                            >
                              {memberEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              memberRole === 'Admin'
                                ? 'bg-[#17E1FF]/20 text-[#17E1FF]'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {memberRole}
                          </div>
                          <button
                            className={`text-xs font-bold hover:underline ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'}`}
                >
                  <h3 className="text-xl font-bold mb-8">Notification Preferences</h3>
                  <div className="space-y-6">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-dashed border-gray-500/20 last:border-0 last:pb-0 gap-4"
                      >
                        <div>
                          <p className="font-bold capitalize mb-1">{key} Notifications</p>
                          <p
                            className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}
                          >
                            Receive updates regarding your projects via {key}.
                          </p>
                        </div>
                        <Toggle
                          isDarkMode={isDarkMode}
                          enabled={value}
                          onChange={() =>
                            setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Placeholder for other tabs */}
              {['security', 'billing'].includes(activeTab) && (
                <motion.div
                  key="placeholder"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`p-8 sm:p-12 rounded-3xl border backdrop-blur-2xl text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'}`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#17E1FF]/10 text-[#17E1FF] flex items-center justify-center mx-auto mb-4">
                    <KeyIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Restricted Area</h3>
                  <p
                    className={`text-sm max-w-md mx-auto ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}
                  >
                    This module is currently locked by the administrator or under maintenance. Check
                    back later.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Settings;
