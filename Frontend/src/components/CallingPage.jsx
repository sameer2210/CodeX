import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch } from '../../../../store/hooks';

const CallingPage = ({
  isInCall,
  callType,
  selectedUser,
  isMuted,
  isVideoOff,
  isSpeakerOn,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onEndCall,
  localVideoRef,
  remoteVideoRef,
  isMinimized,
  onToggleMinimize,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('excellent');

  useEffect(() => {
    if (!isInCall) return;

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isInCall]);

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const controlVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  if (!isInCall) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`fixed ${
          isMinimized ? 'bottom-6 right-6 w-80 h-64 rounded-2xl' : 'inset-0 rounded-none'
        } bg-gradient-to-br from-[#0B0E12] via-[#111418] to-[#0B0E12] z-50 overflow-hidden shadow-2xl`}
        style={{
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Remote Video Stream */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.9)' }}
          />

          {/* Gradient Overlay for Better Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {callType === 'video' && !isVideoOff && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute bottom-6 right-6 w-48 h-36 rounded-xl overflow-hidden shadow-2xl"
            style={{
              border: '2px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm">
              <span className="text-[10px] font-medium text-white/90">You</span>
            </div>
          </motion.div>
        )}

        {/* Call Info Header */}
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="absolute top-0 left-0 right-0 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-light tracking-tight text-white">{selectedUser}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-normal text-white/60">
                    {callType === 'video' ? 'Video Call' : 'Voice Call'}
                  </span>
                  <span className="text-sm font-medium text-white/90">
                    {formatDuration(callDuration)}
                  </span>
                </div>
              </div>

              {/* Connection Quality Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionQuality === 'excellent'
                      ? 'bg-emerald-400'
                      : connectionQuality === 'good'
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                  }`}
                />
                <span className="text-xs font-medium text-white/80 capitalize">
                  {connectionQuality}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Call Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`absolute ${
            isMinimized ? 'bottom-4 left-4 right-4' : 'bottom-8 left-1/2 -translate-x-1/2'
          }`}
        >
          <div
            className={`flex items-center justify-center ${
              isMinimized ? 'gap-2' : 'gap-4'
            } p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10`}
          >
            {/* Mute Button */}
            <motion.button
              variants={controlVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onToggleMute}
              className={`${
                isMinimized ? 'p-2.5' : 'p-4'
              } rounded-full transition-all duration-300 ${
                isMuted ? 'bg-red-500/90 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'
              }`}
              style={{ backdropFilter: 'blur(10px)' }}
            >
              {isMuted ? (
                <MicOff className={isMinimized ? 'w-4 h-4' : 'w-5 h-5'} />
              ) : (
                <Mic className={isMinimized ? 'w-4 h-4' : 'w-5 h-5'} />
              )}
            </motion.button>

            {/* Video Toggle (if video call) */}
            {callType === 'video' && !isMinimized && (
              <motion.button
                variants={controlVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={onToggleVideo}
                className={`p-4 rounded-full transition-all duration-300 ${
                  isVideoOff ? 'bg-red-500/90 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'
                }`}
                style={{ backdropFilter: 'blur(10px)' }}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </motion.button>
            )}

            {/* Speaker Toggle */}
            {!isMinimized && (
              <motion.button
                variants={controlVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={onToggleSpeaker}
                className={`p-4 rounded-full transition-all duration-300 ${
                  !isSpeakerOn ? 'bg-red-500/90 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'
                }`}
                style={{ backdropFilter: 'blur(10px)' }}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </motion.button>
            )}

            {/* End Call Button */}
            <motion.button
              variants={controlVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onEndCall}
              className={`${
                isMinimized ? 'p-2.5' : 'p-4'
              } rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300`}
            >
              <PhoneOff className={isMinimized ? 'w-4 h-4' : 'w-5 h-5'} />
            </motion.button>

            {/* Minimize/Maximize Toggle */}
            <motion.button
              variants={controlVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onToggleMinimize}
              className={`${
                isMinimized ? 'p-2.5' : 'p-4'
              } rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300`}
              style={{ backdropFilter: 'blur(10px)' }}
            >
              {isMinimized ? (
                <Maximize2 className={isMinimized ? 'w-4 h-4' : 'w-5 h-5'} />
              ) : (
                <Minimize2 className={isMinimized ? 'w-4 h-4' : 'w-5 h-5'} />
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallingPage;
