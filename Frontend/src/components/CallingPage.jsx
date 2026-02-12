// src/components/CallingPage.jsx
import { motion } from 'framer-motion';
import { Maximize2, Mic, MicOff, Minimize2, Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { CALL_STATUS, callEndRequested, setMuted, setVideoOff } from '../store/slices/callSlice';
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

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const handler = () => setIsDesktop(media.matches);
    if (media.addEventListener) {
      media.addEventListener('change', handler);
    } else {
      media.addListener(handler);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handler);
      } else {
        media.removeListener(handler);
      }
    };
  }, []);

  return isDesktop;
};

export const AudioCallPage = ({ onEnd }) => {
  const dispatch = useAppDispatch();
  const call = useAppSelector(state => state.call);
  const remoteAudioRef = useRef(null);
  const callDuration = useCallDuration(call.status);
  const isDesktop = useIsDesktop();
  const [isCompact, setIsCompact] = useState(false);

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
      className={`fixed z-50 transition-all duration-300 ${
        isCompact
          ? 'bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]'
          : isDesktop
            ? 'top-6 left-1/2 -translate-x-1/2'
            : 'inset-0'
      }`}
      style={
        isDesktop
          ? {
              width: isCompact ? '320px' : 'min(1100px, calc(100vw - 4rem))',
              height: isCompact ? '220px' : 'min(720px, calc(100vh - 4rem))',
              minWidth: isCompact ? '260px' : '520px',
              minHeight: isCompact ? '180px' : '360px',
              maxWidth: 'calc(100vw - 2.5rem)',
              maxHeight: 'calc(100vh - 2.5rem)',
              resize: isCompact ? 'none' : 'both',
              overflow: 'hidden',
            }
          : isCompact
            ? {
                width: '280px',
                height: '190px',
                maxWidth: 'calc(100vw - 2rem)',
                maxHeight: 'calc(100vh - 2rem)',
                overflow: 'hidden',
              }
            : undefined
      }
    >
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div
        className={`relative h-full w-full flex flex-col items-center justify-center bg-[#0B0E12] ${
          isDesktop ? 'rounded-3xl border border-white/10 shadow-2xl' : ''
        }`}
      >
        <button
          onClick={() => setIsCompact(prev => !prev)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          aria-label={isCompact ? 'Expand call window' : 'Minimize call window'}
        >
          {isCompact ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
        <div className="text-center space-y-4 px-4">
          <div
            className={`rounded-full bg-[#17E1FF]/10 flex items-center justify-center mx-auto animate-pulse ${
              isCompact ? 'w-16 h-16' : 'w-32 h-32'
            }`}
          >
            <Phone className={`${isCompact ? 'w-8 h-8' : 'w-16 h-16'} text-[#17E1FF]`} />
          </div>
          <h2 className={`${isCompact ? 'text-xl' : 'text-3xl'} font-light text-white`}>
            {peerName || 'Unknown'}
          </h2>
          <p className={`${isCompact ? 'text-sm' : 'text-xl'} text-gray-400`}>{getStatusText()}</p>
          {call.error && <p className="text-xs text-red-400 max-w-sm mx-auto">{call.error}</p>}
          {call.status === CALL_STATUS.ACCEPTED && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-500">Connected</span>
            </div>
          )}
        </div>

        <div
          className={`absolute left-0 right-0 flex justify-center ${
            isCompact ? 'bottom-4 space-x-4' : 'bottom-12 space-x-8'
          }`}
        >
          <button
            onClick={handleMuteToggle}
            className={`rounded-full ${
              call.isMuted ? 'bg-red-600' : 'bg-white/10'
            } text-white hover:opacity-90 transition-all ${isCompact ? 'p-3' : 'p-6'}`}
          >
            {call.isMuted ? (
              <MicOff className={isCompact ? 'w-5 h-5' : 'w-8 h-8'} />
            ) : (
              <Mic className={isCompact ? 'w-5 h-5' : 'w-8 h-8'} />
            )}
          </button>

          <button
            onClick={handleEndCall}
            className={`rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-600/40 transition-all ${
              isCompact ? 'p-3' : 'p-6'
            }`}
          >
            <PhoneOff className={isCompact ? 'w-5 h-5' : 'w-8 h-8'} />
          </button>
        </div>
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
  const isDesktop = useIsDesktop();
  const [isCompact, setIsCompact] = useState(false);

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
      className={`fixed z-50 transition-all duration-300 ${
        isCompact
          ? 'bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]'
          : isDesktop
            ? 'top-6 left-1/2 -translate-x-1/2'
            : 'inset-0'
      }`}
      style={
        isDesktop
          ? {
              width: isCompact ? '360px' : 'min(1200px, calc(100vw - 4rem))',
              height: isCompact ? '240px' : 'min(720px, calc(100vh - 4rem))',
              minWidth: isCompact ? '280px' : '640px',
              minHeight: isCompact ? '200px' : '420px',
              maxWidth: 'calc(100vw - 2.5rem)',
              maxHeight: 'calc(100vh - 2.5rem)',
              resize: isCompact ? 'none' : 'both',
              overflow: 'hidden',
            }
          : isCompact
            ? {
                width: '320px',
                height: '200px',
                maxWidth: 'calc(100vw - 2rem)',
                maxHeight: 'calc(100vh - 2rem)',
                overflow: 'hidden',
              }
            : undefined
      }
    >
      {/* Remote Video */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-[#0B0E12] ${
          isDesktop ? 'rounded-3xl border border-white/10 shadow-2xl' : ''
        }`}
      >
        <button
          onClick={() => setIsCompact(prev => !prev)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          aria-label={isCompact ? 'Expand call window' : 'Minimize call window'}
        >
          {isCompact ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        {call.status !== CALL_STATUS.ACCEPTED && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`rounded-full bg-[#17E1FF]/10 flex items-center justify-center mx-auto mb-4 animate-pulse ${
                  isCompact ? 'w-16 h-16' : 'w-32 h-32'
                }`}
              >
                <Video className={`${isCompact ? 'w-8 h-8' : 'w-16 h-16'} text-[#17E1FF]`} />
              </div>
              <p className={`${isCompact ? 'text-sm' : 'text-xl'} text-white`}>
                {call.status === CALL_STATUS.CALLING ? 'Calling...' : 'Connecting...'}
              </p>
              {call.error && <p className="text-sm text-red-400 mt-2 max-w-xs">{call.error}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Local Video PIP */}
      {!call.isVideoOff && (
        <div
          className={`absolute bg-black rounded-xl overflow-hidden border-2 border-[#17E1FF]/30 shadow-2xl ${
            isCompact ? 'top-3 right-3 w-24 h-32' : 'top-6 right-6 w-48 h-64'
          }`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Top Info */}
      <div className={`absolute text-white z-10 ${isCompact ? 'top-3 left-3' : 'top-6 left-6'}`}>
        <h2 className={`${isCompact ? 'text-lg' : 'text-2xl'} font-light`}>
          {peerName || 'Unknown'}
        </h2>
        <div className="flex items-center space-x-3 mt-1">
          <p className={`${isCompact ? 'text-xs' : 'text-lg'} text-gray-300`}>
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
      <div
        className={`absolute left-0 right-0 flex justify-center z-10 ${
          isCompact ? 'bottom-3 space-x-3' : 'bottom-8 space-x-6'
        }`}
      >
        <button
          onClick={handleMuteToggle}
          className={`rounded-full ${call.isMuted ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all ${
            isCompact ? 'p-3' : 'p-5'
          }`}
        >
          {call.isMuted ? (
            <MicOff className={isCompact ? 'w-5 h-5' : 'w-7 h-7'} />
          ) : (
            <Mic className={isCompact ? 'w-5 h-5' : 'w-7 h-7'} />
          )}
        </button>

        <button
          onClick={handleVideoToggle}
          className={`rounded-full ${call.isVideoOff ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all ${
            isCompact ? 'p-3' : 'p-5'
          }`}
        >
          {call.isVideoOff ? (
            <VideoOff className={isCompact ? 'w-5 h-5' : 'w-7 h-7'} />
          ) : (
            <Video className={isCompact ? 'w-5 h-5' : 'w-7 h-7'} />
          )}
        </button>

        <button
          onClick={handleEndCall}
          className={`rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-600/50 transition-all ${
            isCompact ? 'p-3' : 'p-5'
          }`}
        >
          <PhoneOff className={isCompact ? 'w-5 h-5' : 'w-7 h-7'} />
        </button>
      </div>
    </motion.div>
  );
};

const CallingPage = ({ type = 'audio', ...props }) => {
  return type === 'video' ? <VideoCallPage {...props} /> : <AudioCallPage {...props} />;
};

export default CallingPage;
