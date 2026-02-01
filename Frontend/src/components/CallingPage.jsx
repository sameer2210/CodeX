// src/components/ui/CallingPage.jsx

import { motion } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  getMedia,
  stopMedia,
  toggleAudio as toggleAudioTrack,
  toggleVideo as toggleVideoTrack,
} from '../webrtc/media';
import {
  addIceCandidate,
  addTrack,
  closePeer,
  createAnswer,
  createOffer,
  createPeer,
  setRemoteDescription,
} from '../webrtc/peer';

export const AudioCallPage = ({ user, isIncoming, offer, onEnd }) => {
  const dispatch = useAppDispatch();
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState(isIncoming ? 'connecting' : 'calling');
  const cleanupRef = useRef(false);
  const remoteAudioRef = useRef(null);

  // Call duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize WebRTC for audio call
  useEffect(() => {
    let mounted = true;
    let stream = null;
    let peer = null;

    const initializeCall = async () => {
      if (cleanupRef.current) return;

      try {
        console.log('Initializing audio call...');
        setCallState('connecting');

        // Get audio stream
        stream = await getMedia({ audio: true, video: false });
        if (!mounted || cleanupRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        // Create peer connection
        peer = createPeer();

        // Add tracks to peer
        stream.getTracks().forEach(track => {
          addTrack(track, stream);
        });

        // Setup peer event handlers
        peer.ontrack = event => {
          console.log('Received remote audio track');

          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }

          setCallState('connected');
        };

        // Handle call flow
        if (isIncoming && offer) {
          // Receiving call - set remote offer and create answer
          await setRemoteDescription(offer);
          const answer = await createAnswer();

          dispatch({
            type: 'socket/callAccepted',
            payload: { to: user, answer },
          });

          console.log('Answer sent to caller');
          setCallState('connected');
        } else {
          // Making call - create offer
          const localOffer = await createOffer();

          dispatch({
            type: 'socket/callUser',
            payload: {
              username: user,
              offer: localOffer,
              type: 'audio',
            },
          });

          console.log('Offer sent to callee');
        }
      } catch (error) {
        console.error('Audio call initialization failed:', error);
        setCallState('failed');
        setTimeout(() => onEnd(), 2000);
      }
    };

    initializeCall();

    return () => {
      mounted = false;
      cleanupRef.current = true;
    };
  }, []);

  // Handle call accepted event
  useEffect(() => {
    const handleCallAccepted = async event => {
      try {
        const { answer } = event.detail;
        console.log('Call accepted, setting answer');
        await setRemoteDescription(answer);
        setCallState('connected');
      } catch (error) {
        console.error('Failed to set answer:', error);
      }
    };

    window.addEventListener('call-accepted', handleCallAccepted);
    return () => window.removeEventListener('call-accepted', handleCallAccepted);
  }, []);

  // Handle ICE candidates
  useEffect(() => {
    const handleIceCandidate = event => {
      const { candidate } = event.detail;
      dispatch({
        type: 'socket/iceCandidate',
        payload: { to: user, candidate },
      });
    };

    const handleIncomingIceCandidate = event => {
      const { candidate } = event.detail;
      addIceCandidate(candidate);
    };

    window.addEventListener('ice-candidate-generated', handleIceCandidate);
    window.addEventListener('ice-candidate', handleIncomingIceCandidate);

    return () => {
      window.removeEventListener('ice-candidate-generated', handleIceCandidate);
      window.removeEventListener('ice-candidate', handleIncomingIceCandidate);
    };
  }, [user, dispatch]);

  // Handle call end
  useEffect(() => {
    const handleEndCall = () => {
      console.log('Call ended by remote peer');
      handleEndCall();
    };

    window.addEventListener('end-call', handleEndCall);
    return () => window.removeEventListener('end-call', handleEndCall);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up audio call');
      stopMedia();
      closePeer();
    };
  }, []);

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    toggleAudioTrack(!newMuted);
    setIsMuted(newMuted);
  };

  const handleEndCall = () => {
    dispatch({
      type: 'socket/endCall',
      payload: { to: user },
    });
    stopMedia();
    closePeer();
    onEnd();
  };

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callState) {
      case 'calling':
        return 'Calling...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatDuration(callDuration);
      case 'failed':
        return 'Call Failed';
      default:
        return 'Audio Call';
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
        <div
          className={`w-32 h-32 rounded-full bg-[#17E1FF]/10 flex items-center justify-center mx-auto ${callState === 'connecting' ? 'animate-pulse' : ''}`}
        >
          <Phone className="w-16 h-16 text-[#17E1FF]" />
        </div>
        <h2 className="text-3xl font-light text-white">{user}</h2>
        <p className="text-xl text-gray-400">{getStatusText()}</p>
        {callState === 'connected' && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-emerald-500">Connected</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center space-x-8">
        <button
          onClick={handleMuteToggle}
          className={`p-6 rounded-full ${isMuted ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all`}
        >
          {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
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

export const VideoCallPage = ({ user, isIncoming, offer, onEnd }) => {
  const dispatch = useAppDispatch();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState(isIncoming ? 'connecting' : 'calling');
  const cleanupRef = useRef(false);

  // Call duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize WebRTC for video call
  useEffect(() => {
    let mounted = true;
    let stream = null;
    let peer = null;

    const initializeCall = async () => {
      if (cleanupRef.current) return;

      try {
        console.log('🎥 Initializing video call...');
        setCallState('connecting');

        // Get video + audio stream
        stream = await getMedia({ audio: true, video: true });
        if (!mounted || cleanupRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Create peer connection
        peer = createPeer();

        // Add tracks to peer
        stream.getTracks().forEach(track => {
          addTrack(track, stream);
        });

        // Setup peer event handlers
        peer.ontrack = event => {
          console.log('📹 Received remote track:', event.track.kind);
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallState('connected');
          }
        };

        // Handle call flow
        if (isIncoming && offer) {
          // Receiving call - set remote offer and create answer
          await setRemoteDescription(offer);
          const answer = await createAnswer();

          dispatch({
            type: 'socket/callAccepted',
            payload: { to: user, answer },
          });

          console.log('Answer sent to caller');
          setCallState('connected');
        } else {
          // Making call - create offer
          const localOffer = await createOffer();

          dispatch({
            type: 'socket/callUser',
            payload: {
              username: user,
              offer: localOffer,
              type: 'video',
            },
          });

          console.log('Offer sent to callee');
        }
      } catch (error) {
        console.error('Video call initialization failed:', error);
        setCallState('failed');
        setTimeout(() => onEnd(), 2000);
      }
    };

    initializeCall();

    return () => {
      mounted = false;
      cleanupRef.current = true;
    };
  }, []);

  // Handle call accepted event
  useEffect(() => {
    const handleCallAccepted = async event => {
      try {
        const { answer } = event.detail;
        console.log('Call accepted, setting answer');
        await setRemoteDescription(answer);
        setCallState('connected');
      } catch (error) {
        console.error('Failed to set answer:', error);
      }
    };

    window.addEventListener('call-accepted', handleCallAccepted);
    return () => window.removeEventListener('call-accepted', handleCallAccepted);
  }, []);

  // Handle ICE candidates
  useEffect(() => {
    const handleIceCandidate = event => {
      const { candidate } = event.detail;
      dispatch({
        type: 'socket/iceCandidate',
        payload: { to: user, candidate },
      });
    };

    const handleIncomingIceCandidate = event => {
      const { candidate } = event.detail;
      addIceCandidate(candidate);
    };

    window.addEventListener('ice-candidate-generated', handleIceCandidate);
    window.addEventListener('ice-candidate', handleIncomingIceCandidate);

    return () => {
      window.removeEventListener('ice-candidate-generated', handleIceCandidate);
      window.removeEventListener('ice-candidate', handleIncomingIceCandidate);
    };
  }, [user, dispatch]);

  // Handle call end
  useEffect(() => {
    const handleRemoteEndCall = () => {
      console.log('📞 Call ended by remote peer');
      handleEndCall();
    };

    window.addEventListener('end-call', handleRemoteEndCall);
    return () => window.removeEventListener('end-call', handleRemoteEndCall);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up video call');
      stopMedia();
      closePeer();
    };
  }, []);

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    toggleAudioTrack(!newMuted);
    setIsMuted(newMuted);
  };

  const handleVideoToggle = () => {
    const newVideoOff = !isVideoOff;
    toggleVideoTrack(!newVideoOff);
    setIsVideoOff(newVideoOff);
  };

  const handleEndCall = () => {
    dispatch({
      type: 'socket/endCall',
      payload: { to: user },
    });
    stopMedia();
    closePeer();
    onEnd();
  };

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
      <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E12]">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        {callState !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-[#17E1FF]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Video className="w-16 h-16 text-[#17E1FF]" />
              </div>
              <p className="text-white text-xl">
                {callState === 'calling' ? 'Calling...' : 'Connecting...'}
              </p>
            </div>
          </div>
        )}
      </div>

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

      {/* Top Info */}
      <div className="absolute top-6 left-6 text-white z-10">
        <h2 className="text-2xl font-light">{user}</h2>
        <div className="flex items-center space-x-3 mt-1">
          <p className="text-lg text-gray-300">{formatDuration(callDuration)}</p>
          {callState === 'connected' && (
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
          className={`p-5 rounded-full ${isMuted ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all`}
        >
          {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>

        <button
          onClick={handleVideoToggle}
          className={`p-5 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-white/10'} text-white hover:opacity-90 transition-all`}
        >
          {isVideoOff ? <VideoOff className="w-7 h-7" /> : <Video className="w-7 h-7" />}
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

// Default export wrapper
const CallingPage = ({ type = 'audio', ...props }) => {
  return type === 'video' ? <VideoCallPage {...props} /> : <AudioCallPage {...props} />;
};

export default CallingPage;
