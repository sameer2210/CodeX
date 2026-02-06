// src/components/CallingPage.jsx
import { motion } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  CALL_STATUS,
  callEndRequested,
  setMuted,
  setVideoOff,
} from '../store/slices/callSlice';
import { toggleAudio, toggleVideo } from '../webrtc/callManager';

const useCallDuration = status => {
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (status !== CALL_STATUS.ACCEPTED) {
      setCallDuration(0);
      return undefined;
    }

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  return callDuration;
};

const formatDuration = seconds => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const AudioCallPage = ({ onEnd }) => {
  const dispatch = useAppDispatch();
  const call = useAppSelector(state => state.call);
  const remoteAudioRef = useRef(null);
  const callDuration = useCallDuration(call.status);

  const peerName = call.direction === 'incoming' ? call.caller : call.receiver;

  useEffect(() => {
    if (remoteAudioRef.current && call.remoteStream) {
      remoteAudioRef.current.srcObject = call.remoteStream;
    }
  }, [call.remoteStream]);

  const handleMuteToggle = () => {
    const newMuted = !call.isMuted;
    toggleAudio(!newMuted);
    dispatch(setMuted(newMuted));
  };

  const handleEndCall = () => {
    dispatch(callEndRequested());
    onEnd?.();
  };

  const getStatusText = () => {
    switch (call.status) {
      case CALL_STATUS.CALLING:
        return 'Calling...';
      case CALL_STATUS.ACCEPTED:
        return formatDuration(callDuration);
      case CALL_STATUS.FAILED:
        return 'Call Failed';
      default:
        return 'Connecting...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0B0E12] z-50 flex flex-col items-center justify-center"
    >
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div className="text-center space-y-6">
        <div className="w-32 h-32 rounded-full bg-[#17E1FF]/10 flex items-center justify-center mx-auto animate-pulse">
          <Phone className="w-16 h-16 text-[#17E1FF]" />
        </div>
        <h2 className="text-3xl font-light text-white">{peerName || 'Unknown'}</h2>
        <p className="text-xl text-gray-400">{getStatusText()}</p>
        {call.error && <p className="text-sm text-red-400 max-w-sm mx-auto">{call.error}</p>}
        {call.status === CALL_STATUS.ACCEPTED && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-emerald-500">Connected</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center space-x-8">
        <button
          onClick={handleMuteToggle}
          className={`p-6 rounded-full ${call.isMuted ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all`}
        >
          {call.isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-6 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-600/40 transition-all"
        >
          <PhoneOff className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
};

export const VideoCallPage = ({ onEnd }) => {
  const dispatch = useAppDispatch();
  const call = useAppSelector(state => state.call);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callDuration = useCallDuration(call.status);

  const peerName = call.direction === 'incoming' ? call.caller : call.receiver;

  useEffect(() => {
    if (remoteVideoRef.current && call.remoteStream) {
      remoteVideoRef.current.srcObject = call.remoteStream;
    }
  }, [call.remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && call.localStream) {
      localVideoRef.current.srcObject = call.localStream;
    }
  }, [call.localStream]);

  const handleMuteToggle = () => {
    const newMuted = !call.isMuted;
    toggleAudio(!newMuted);
    dispatch(setMuted(newMuted));
  };

  const handleVideoToggle = () => {
    const newVideoOff = !call.isVideoOff;
    toggleVideo(!newVideoOff);
    dispatch(setVideoOff(newVideoOff));
  };

  const handleEndCall = () => {
    dispatch(callEndRequested());
    onEnd?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Remote Video */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E12]">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        {call.status !== CALL_STATUS.ACCEPTED && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-[#17E1FF]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Video className="w-16 h-16 text-[#17E1FF]" />
              </div>
              <p className="text-white text-xl">
                {call.status === CALL_STATUS.CALLING ? 'Calling...' : 'Connecting...'}
              </p>
              {call.error && <p className="text-sm text-red-400 mt-2 max-w-xs">{call.error}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Local Video PIP */}
      {!call.isVideoOff && (
        <div className="absolute top-6 right-6 w-48 h-64 bg-black rounded-xl overflow-hidden border-2 border-[#17E1FF]/30 shadow-2xl">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
      )}

      {/* Top Info */}
      <div className="absolute top-6 left-6 text-white z-10">
        <h2 className="text-2xl font-light">{peerName || 'Unknown'}</h2>
        <div className="flex items-center space-x-3 mt-1">
          <p className="text-lg text-gray-300">
            {call.status === CALL_STATUS.ACCEPTED ? formatDuration(callDuration) : '00:00'}
          </p>
          {call.status === CALL_STATUS.ACCEPTED && (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-500">Connected</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-6 z-10">
        <button
          onClick={handleMuteToggle}
          className={`p-5 rounded-full ${call.isMuted ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all`}
        >
          {call.isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>

        <button
          onClick={handleVideoToggle}
          className={`p-5 rounded-full ${call.isVideoOff ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all`}
        >
          {call.isVideoOff ? <VideoOff className="w-7 h-7" /> : <Video className="w-7 h-7" />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-600/50 transition-all"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </motion.div>
  );
};

const CallingPage = ({ type = 'audio', ...props }) => {
  return type === 'video' ? <VideoCallPage {...props} /> : <AudioCallPage {...props} />;
};

export default CallingPage;
