// callingpage.jsx (unchanged, as no major issues were identified here)
import { motion } from 'framer-motion';
import { Mic, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export const AudioCallPage = ({ user, isIncoming, offer, onEnd }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Here you would initialize WebRTC, getUserMedia({audio: true}), etc.

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0B0E12] z-50 flex flex-col items-center justify-center"
    >
      <div className="text-center space-y-6">
        <div className="w-32 h-32 rounded-full bg-[#17E1FF]/10 flex items-center justify-center mx-auto animate-pulse">
          <Phone className="w-16 h-16 text-[#17E1FF]" />
        </div>
        <h2 className="text-3xl font-light text-white">{user}</h2>
        <p className="text-xl text-gray-400">
          {isIncoming ? 'Incoming Audio Call' : 'Audio Calling...'}
        </p>
        <p className="text-2xl font-mono text-[#17E1FF] tracking-wider">
          {formatDuration(callDuration)}
        </p>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center space-x-8">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-6 rounded-full ${isMuted ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all`}
        >
          {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        <button
          onClick={onEnd}
          className="p-6 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-600/40 transition-all"
        >
          <PhoneOff className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
};

export const VideoCallPage = ({ user, isIncoming, offer, onEnd }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize camera
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('Video access error:', err));
  }, []);

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Local Video PIP */}
      {!isVideoOff && (
        <div className="absolute top-6 right-6 w-48 h-64 bg-black rounded-xl overflow-hidden border-2 border-[#17E1FF]/30 shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-6">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-5 rounded-full ${isMuted ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all`}
        >
          {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-5 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all`}
        >
          {isVideoOff ? <VideoOff className="w-7 h-7" /> : <Video className="w-7 h-7" />}
        </button>

        <button
          onClick={onEnd}
          className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-600/50 transition-all"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>

      {/* Top Info */}
      <div className="absolute top-6 left-6 text-white">
        <h2 className="text-2xl font-light">{user}</h2>
        <p className="text-lg text-gray-300 mt-1">{formatDuration(callDuration)}</p>
      </div>
    </motion.div>
  );
};

// ✅ DEFAULT EXPORT (wrapper)
const CallingPage = ({ type = 'audio', ...props }) => {
  return type === 'video' ? <VideoCallPage {...props} /> : <AudioCallPage {...props} />;
};

export default CallingPage;
