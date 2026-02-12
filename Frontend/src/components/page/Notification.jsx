import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const Notification = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 relative ${
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

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#17E1FF]">
              Notifications
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              Updates Center
            </h1>
            <p
              className={`mt-3 text-sm sm:text-base ${
                isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'
              }`}
            >
              Stay on top of project activity and team alerts.
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border backdrop-blur-2xl p-10 min-h-[320px] flex flex-col items-center justify-center text-center ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/10'
          }`}
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              isDarkMode ? 'bg-white/5' : 'bg-black/5'
            }`}
          >
            <BellIcon className="w-9 h-9 text-[#17E1FF]" />
          </div>
          <h2 className="text-xl font-bold mb-2">No notifications yet</h2>
          <p
            className={`text-sm ${
              isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'
            }`}
          >
            When there is new activity, it will appear here.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Notification;
