import { AnimatePresence, motion } from 'framer-motion';
import {
  Circle,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Minimize2,
  Phone,
  PhoneOff,
  Send,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  selectCurrentProjectActiveUsers,
  selectCurrentProjectMessages,
  selectCurrentProjectTypingUsers,
} from '../../../../store/slices/projectSlice';

const ChatSection = ({ projectId }) => {
  const dispatch = useAppDispatch();

  // Selectors
  const messages = useAppSelector(selectCurrentProjectMessages);
  const activeUsers = useAppSelector(selectCurrentProjectActiveUsers);
  const typingUsers = useAppSelector(selectCurrentProjectTypingUsers);
  const currentUser = useAppSelector(state => state.auth.user?.username);
  const isDarkMode = useAppSelector(state => state.ui.isDarkMode);
  const socketConnected = useAppSelector(state => state.socket.connected);

  // Local state
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Call state
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' | 'video'
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  /* ========== RESPONSIVE HANDLING ========== */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ========== AUTO SCROLL ========== */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ========== TYPING INDICATOR ========== */
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      dispatch({
        type: 'socket/typingStart',
        payload: { projectId },
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      dispatch({
        type: 'socket/typingStop',
        payload: { projectId },
      });
    }, 2000);
  }, [isTyping, dispatch, projectId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        dispatch({
          type: 'socket/typingStop',
          payload: { projectId },
        });
      }
    };
  }, [isTyping, dispatch, projectId]);

  /* ========== MESSAGE HANDLING ========== */
  const handleSendMessage = useCallback(
    e => {
      e.preventDefault();
      const trimmedMessage = message.trim();
      if (!trimmedMessage || !socketConnected) return;

      dispatch({
        type: 'socket/sendChatMessage',
        payload: {
          projectId,
          text: trimmedMessage,
        },
      });

      setMessage('');
      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      dispatch({
        type: 'socket/typingStop',
        payload: { projectId },
      });

      messageInputRef.current?.focus();
    },
    [message, socketConnected, dispatch, projectId]
  );

  const handleInputChange = useCallback(
    e => {
      setMessage(e.target.value);
      if (e.target.value.trim()) {
        handleTyping();
      }
    },
    [handleTyping]
  );

  const handleKeyPress = useCallback(
    e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    },
    [handleSendMessage]
  );

  /* ========== WEBRTC CALL FUNCTIONS ========== */
  const initializePeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = event => {
      if (event.candidate && selectedUser) {
        dispatch({
          type: 'socket/iceCandidate',
          payload: {
            to: selectedUser,
            candidate: event.candidate,
          },
        });
      }
    };

    pc.ontrack = event => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [selectedUser, dispatch]);

  const startCall = async (type, user) => {
    try {
      setSelectedUser(user);
      setCallType(type);

      const constraints = {
        audio: true,
        video: type === 'video' ? { width: 1280, height: 720 } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      const pc = initializePeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      dispatch({
        type: 'socket/callUser',
        payload: {
          username: user,
          offer: offer,
          type: type,
        },
      });

      setIsInCall(true);
    } catch (error) {
      console.error('Error starting call:', error);
      dispatch({
        type: 'ui/addToast',
        payload: {
          message: 'Failed to start call. Please check camera/microphone permissions.',
          type: 'error',
        },
      });
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      const constraints = {
        audio: true,
        video: incomingCall.type === 'video' ? { width: 1280, height: 720 } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && incomingCall.type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      const pc = initializePeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      dispatch({
        type: 'socket/callAccepted',
        payload: {
          to: incomingCall.from,
          answer: answer,
        },
      });

      setIsInCall(true);
      setCallType(incomingCall.type);
      setSelectedUser(incomingCall.from);
      setIncomingCall(null);
    } catch (error) {
      console.error('Error answering call:', error);
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      dispatch({
        type: 'socket/callRejected',
        payload: { to: incomingCall.from },
      });
      setIncomingCall(null);
    }
  };

  const endCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (selectedUser) {
      dispatch({
        type: 'socket/endCall',
        payload: { to: selectedUser },
      });
    }

    setIsInCall(false);
    setCallType(null);
    setSelectedUser(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsCallMinimized(false);
  }, [selectedUser, dispatch]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && callType === 'video') {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = isSpeakerOn;
    }
  };

  /* ========== SOCKET LISTENERS FOR CALLS ========== */
  useEffect(() => {
    const handleIncomingCall = data => {
      setIncomingCall(data);
    };

    const handleCallAccepted = async data => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    const handleIceCandidate = async data => {
      if (peerConnectionRef.current && data.candidate) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    // Add socket listeners here if using socket.io
    // socket.on('incoming-call', handleIncomingCall);
    // socket.on('call-accepted', handleCallAccepted);
    // socket.on('end-call', handleCallEnded);
    // socket.on('ice-candidate', handleIceCandidate);

    return () => {
      // socket.off('incoming-call', handleIncomingCall);
      // socket.off('call-accepted', handleCallAccepted);
      // socket.off('end-call', handleCallEnded);
      // socket.off('ice-candidate', handleIceCandidate);
    };
  }, [endCall]);

  /* ========== RENDER HELPERS ========== */
  const formatTime = timestamp => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (msg, index) => {
    const isCurrentUser = msg.username === currentUser;
    const isSystem = msg.type === 'system';

    if (isSystem) {
      return (
        <motion.div
          key={msg._id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center my-2"
        >
          <div
            className={`text-xs px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
          >
            {msg.message}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={msg._id || index}
        initial={{ opacity: 0, x: isCurrentUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div className={`max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
          {!isCurrentUser && (
            <div className="text-xs font-medium mb-1 px-1 text-blue-500">{msg.username}</div>
          )}
          <div
            className={`px-3 md:px-4 py-2 rounded-2xl ${
              isCurrentUser
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
            }`}
          >
            <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
          </div>
          <div
            className={`text-xs mt-1 px-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} ${isCurrentUser ? 'text-right' : 'text-left'}`}
          >
            {formatTime(msg.createdAt)}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingText =
      typingUsers.length === 1
        ? `${typingUsers[0]} is typing`
        : typingUsers.length === 2
          ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
          : `${typingUsers.length} people are typing`;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center space-x-2 px-4 py-2"
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {typingText}
        </span>
      </motion.div>
    );
  };

  /* ========== RENDER ========== */
  return (
    <div
      className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} relative`}
    >
      {/* Call Window */}
      <AnimatePresence>
        {isInCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute ${
              isCallMinimized ? 'bottom-4 right-4 w-32 h-32 md:w-48 md:h-48' : 'inset-0'
            } ${isDarkMode ? 'bg-gray-800' : 'bg-gray-900'} rounded-lg z-50 overflow-hidden`}
          >
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local Video (Picture-in-Picture) */}
            {callType === 'video' && !isVideoOff && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`absolute ${
                  isCallMinimized ? 'hidden' : 'bottom-4 right-4 w-24 h-24 md:w-32 md:h-32'
                } rounded-lg border-2 border-white object-cover`}
              />
            )}

            {/* Call Controls */}
            <div
              className={`absolute ${isCallMinimized ? 'bottom-2 left-2 right-2' : 'bottom-4 left-1/2 transform -translate-x-1/2'} flex items-center justify-center space-x-2`}
            >
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {callType === 'video' && !isCallMinimized && (
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80`}
                  title={isVideoOff ? 'Turn on video' : 'Turn off video'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {!isCallMinimized && (
                <button
                  onClick={toggleSpeaker}
                  className={`p-3 rounded-full ${!isSpeakerOn ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80`}
                  title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
                title="End call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>

              {!isCallMinimized && (
                <button
                  onClick={() => setIsCallMinimized(true)}
                  className="p-3 rounded-full bg-gray-700 text-white hover:opacity-80"
                  title="Minimize"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              )}

              {isCallMinimized && (
                <button
                  onClick={() => setIsCallMinimized(false)}
                  className="p-2 rounded-full bg-gray-700 text-white hover:opacity-80"
                  title="Maximize"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Call Info */}
            {!isCallMinimized && (
              <div className="absolute top-4 left-4 text-white">
                <p className="text-sm font-medium">{selectedUser}</p>
                <p className="text-xs opacity-70">
                  {callType === 'video' ? 'Video Call' : 'Voice Call'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Call Notification */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-4 left-4 right-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl border-2 border-blue-500 p-4 z-50`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Incoming {incomingCall.type} call
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  from {incomingCall.from}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={answerCall}
                  className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  onClick={rejectCall}
                  className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 md:px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="flex items-center space-x-2">
          <MessageSquare
            className={`w-4 h-4 md:w-5 md:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
          />
          <h3
            className={`font-semibold text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Team Chat
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Active Users */}
          <div className="relative">
            <button
              onClick={() => setShowUserList(!showUserList)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{activeUsers.length + 1}</span>
            </button>

            {/* User List Dropdown */}
            <AnimatePresence>
              {showUserList && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border z-10 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="p-2 max-h-64 overflow-y-auto">
                    <div
                      className={`text-xs font-semibold mb-2 px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Active Users
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`flex items-center justify-between px-2 py-1.5 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                          <span
                            className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {currentUser} (You)
                          </span>
                        </div>
                      </div>
                      {activeUsers.map((user, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between px-2 py-1.5 rounded ${
                            isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                            <span
                              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              {user}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                startCall('audio', user);
                                setShowUserList(false);
                              }}
                              className="p-1 rounded hover:bg-gray-600"
                              title="Audio call"
                            >
                              <Phone className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                startCall('video', user);
                                setShowUserList(false);
                              }}
                              className="p-1 rounded hover:bg-gray-600"
                              title="Video call"
                            >
                              <Video className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Connection Status */}
          <Circle
            className={`w-2 h-2 ${socketConnected ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <MessageSquare
              className={`w-10 h-10 md:w-12 md:h-12 mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}
            />
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => renderMessage(msg, index))}
            <AnimatePresence>{renderTypingIndicator()}</AnimatePresence>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div
        className={`px-3 md:px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            ref={messageInputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={socketConnected ? 'Type a message...' : 'Connecting...'}
            disabled={!socketConnected}
            className={`flex-1 px-3 md:px-4 py-2 text-sm md:text-base rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'bg-gray-800 text-white border border-gray-700'
                : 'bg-gray-100 text-gray-900 border border-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />

          <button
            type="submit"
            disabled={!message.trim() || !socketConnected}
            className={`p-2 rounded-lg transition-all ${
              message.trim() && socketConnected
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSection;
