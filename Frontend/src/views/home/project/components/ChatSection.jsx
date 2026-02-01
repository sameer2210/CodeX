// src/views/home/project/components/ChatSection.jsx
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bold,
  Circle,
  Code,
  Image as ImageIcon,
  Italic,
  List,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Strikethrough,
  Users,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown'; // Added for rendering markdown in messages
import { AudioCallPage, VideoCallPage } from '../../../../components/CallingPage';
import { useTheme } from '../../../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  selectCurrentProjectActiveUsers,
  selectCurrentProjectMessages,
  selectCurrentProjectTypingUsers,
} from '../../../../store/slices/projectSlice';

// --- Constants ---
const ACCENT_COLOR = '#17E1FF';
const BG_DARK = '#0B0E12';
const BG_SURFACE = '#111418';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';

const ChatSection = ({ projectId }) => {
  const dispatch = useAppDispatch();

  // --- Selectors ---
  const messages = useAppSelector(selectCurrentProjectMessages);
  const activeUsers = useAppSelector(selectCurrentProjectActiveUsers);
  const typingUsers = useAppSelector(selectCurrentProjectTypingUsers);
  const currentUser = useAppSelector(state => state.auth.user?.username);
  const { isDarkMode } = useTheme();
  const socketConnected = useAppSelector(state => state.socket.connected);

  // --- Local State: Chat & Composer ---
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // --- Call State ---
  const [activeCall, setActiveCall] = useState(null);
  const [callState, setCallState] = useState('IDLE');
  const [incomingCall, setIncomingCall] = useState(null);

  // --- Refs ---
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  /* ========== UTILS ========== */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, attachments]);

  /* ========== TYPING INDICATOR ========== */
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      dispatch({ type: 'socket/typingStart', payload: { projectId } });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      dispatch({ type: 'socket/typingStop', payload: { projectId } });
    }, 2000);
  }, [isTyping, dispatch, projectId]);

  /* ========== COMPOSER LOGIC ========== */
  const handleInputChange = e => {
    setMessage(e.target.value);
    if (e.target.value.trim()) handleTyping();
  };

  const handleSendMessage = e => {
    e?.preventDefault();
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && attachments.length === 0) || !socketConnected) return;

    const finalMessage =
      attachments.length > 0
        ? `${trimmedMessage} [Attachments: ${attachments.length}]`
        : trimmedMessage;

    dispatch({
      type: 'socket/sendChatMessage',
      payload: { projectId, text: finalMessage },
    });

    setMessage('');
    setAttachments([]);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    dispatch({ type: 'socket/typingStop', payload: { projectId } });
    messageInputRef.current?.focus();
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = e => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        url: URL.createObjectURL(file),
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  // --- New: Formatting Handlers ---
  const handleFormat = format => {
    const textarea = messageInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = message.substring(start, end);
    let prefix = '';
    let suffix = '';

    switch (format) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        break;
      case 'italic':
        prefix = '_';
        suffix = '_';
        break;
      case 'strikethrough':
        prefix = '~~';
        suffix = '~~';
        break;
      case 'code':
        prefix = '`';
        suffix = '`';
        break;
      case 'list':
        prefix = '- ';
        suffix = '';
        break;
      default:
        return;
    }

    const newText = prefix + selected + suffix;
    const newMessage = message.substring(0, start) + newText + message.substring(end);
    setMessage(newMessage);

    // Adjust cursor position
    const newCursorPos = start + prefix.length + selected.length;
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
    }, 0);
  };

  /* ========== CALL HANDLERS ========== */
 const startCall = async (type, user) => {
   setCallState('CALLING');

   setActiveCall({ type, user });

   dispatch({
     type: 'socket/callUser',
     payload: {
       username: user,
       type,
     },
   });
 };


  const acceptIncomingCall = () => {
    if (!incomingCall) return;
    setActiveCall({
      type: incomingCall.type,
      user: incomingCall.from,
      isIncoming: true,
      offer: incomingCall.offer,
    });
    setIncomingCall(null);
  };

  const rejectIncomingCall = () => {
    if (incomingCall) {
      dispatch({ type: 'socket/callRejected', payload: { to: incomingCall.from } });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    setCallState('IDLE');
    setActiveCall(null);
  };

useEffect(() => {
  const handler = e => {
    setIncomingCall(e.detail);
  };

  window.addEventListener('incoming-call', handler);
  return () => window.removeEventListener('incoming-call', handler);
}, []);


  useEffect(() => {
    const handler = e => {
      dispatch({
        type: 'socket/callUser',
        payload: {
          username: activeCall.user,
          offer: e.detail.offer,
          type: activeCall.type,
        },
      });
    };

    window.addEventListener('send-offer', handler);
    return () => window.removeEventListener('send-offer', handler);
  }, [activeCall]);


  const renderMessage = (msg, index) => {
    const isCurrentUser = msg.username === currentUser;
    const isSystem = msg.type === 'system';

    if (isSystem) {
      return (
        <div key={index} className="flex justify-center my-4">
          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
            {msg.message}
          </span>
        </div>
      );
    }

    return (
      <motion.div
        key={msg._id || index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 group`}
      >
        <div
          className={`max-w-[80%] md:max-w-[70%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
        >
          {!isCurrentUser && (
            <span className="text-xs font-medium text-gray-400 mb-1 ml-1">{msg.username}</span>
          )}
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
              isCurrentUser
                ? 'bg-[#2A2E35] text-white rounded-br-sm'
                : 'bg-[#1C1F26] text-gray-200 rounded-bl-sm border border-white/5'
            }`}
          >
            <ReactMarkdown className="prose prose-invert prose-headings:text-white prose-a:text-[#17E1FF] prose-code:text-pink-300 prose-pre:bg-black/30 max-w-none">
              {msg.message}
            </ReactMarkdown>
          </div>
          <span className="text-[10px] text-gray-600 mt-1 px-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Main Chat View */}
      <div
        className="flex flex-col h-full relative overflow-hidden bg-[#0B0E12]"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Background Ambience */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#17E1FF] opacity-[0.03] blur-[120px] pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0B0E12]/80 backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10 shadow-inner">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0B0E12] ${socketConnected ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
            </div>
            <div>
              <h2 className="text-white font-medium tracking-wide">Team Chat</h2>
              <span className="text-xs text-gray-500">{activeUsers.length + 1} members active</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                activeUsers.length > 0 &&
                startCall('audio', activeUsers.length === 1 ? activeUsers[0] : 'Team')
              }
              disabled={activeUsers.length === 0}
              className={`p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                activeUsers.length > 0 &&
                startCall('video', activeUsers.length === 1 ? activeUsers[0] : 'Team')
              }
              disabled={activeUsers.length === 0}
              className={`p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowUserList(!showUserList)}
              className={`p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors ${showUserList ? 'bg-white/5 text-white' : ''}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* USER LIST DROPDOWN */}
        <AnimatePresence>
          {showUserList && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-20 right-6 w-64 bg-[#111418] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
            >
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Active Members
                </h3>
                <div className="space-y-1">
                  {/* You */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#17E1FF]/10 flex items-center justify-center text-[#17E1FF] text-xs font-bold">
                        {currentUser?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-white font-medium">You</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  </div>

                  {/* Others */}
                  {activeUsers.map(user => (
                    <div
                      key={user}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-bold border border-white/5">
                          {user.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white">{user}</span>
                      </div>
                      <div className="flex space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startCall('audio', user)}
                          className="relative z-10 p-1.5 rounded-md text-gray-300 hover:text-[#17E1FF] hover:bg-white/10 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => startCall('video', user)}
                          className="relative z-10 p-1.5 rounded-md text-gray-300 hover:text-[#17E1FF] hover:bg-white/10 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INCOMING CALL BANNER */}
        <AnimatePresence>
          {incomingCall && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
            >
              <div className="pointer-events-auto bg-[#111418]/90 backdrop-blur-xl border border-[#17E1FF]/30 rounded-2xl p-4 shadow-2xl w-80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#17E1FF]/10 flex items-center justify-center animate-pulse">
                    {incomingCall.type === 'audio' ? (
                      <Phone className="w-5 h-5 text-[#17E1FF]" />
                    ) : (
                      <Video className="w-5 h-5 text-[#17E1FF]" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{incomingCall.from}</p>
                    <p className="text-xs text-[#17E1FF]">Incoming {incomingCall.type} call...</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={rejectIncomingCall}
                    className="p-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button
                    onClick={acceptIncomingCall}
                    className="p-2.5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 font-light">Start the conversation</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => renderMessage(msg, index))}
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2 ml-4 mb-4"
                >
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#17E1FF]"
                    />
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#17E1FF]"
                    />
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#17E1FF]"
                    />
                  </div>
                  <span className="text-xs text-[#17E1FF] font-medium">
                    {typingUsers.join(', ')} typing...
                  </span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* COMPOSER */}
        <div className="px-6 pb-6 pt-2">
          {attachments.length > 0 && (
            <div className="flex space-x-3 mb-3 overflow-x-auto pb-2 custom-scrollbar">
              {attachments.map(file => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group flex-shrink-0"
                >
                  <div className="w-20 h-20 rounded-lg bg-[#1C1F26] border border-white/10 flex items-center justify-center overflow-hidden">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Code className="w-6 h-6 text-gray-500 mb-1" />
                        <span className="text-[9px] text-gray-500 uppercase">
                          {file.name.split('.').pop()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setAttachments(prev => prev.filter(a => a.id !== file.id))}
                    className="absolute -top-2 -right-2 bg-[#1C1F26] border border-white/10 text-gray-400 hover:text-red-500 rounded-full p-1 shadow-md transition-colors"
                  >
                    <Circle className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <div className="relative rounded-2xl border bg-[#111418] border-white/10 focus-within:border-white/20">
            <div className="flex items-center px-4 py-2 border-b border-white/5 space-x-1">
              <button
                title="Bold"
                onClick={() => handleFormat('bold')}
                className="p-1.5 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                title="Italic"
                onClick={() => handleFormat('italic')}
                className="p-1.5 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                title="Strikethrough"
                onClick={() => handleFormat('strikethrough')}
                className="p-1.5 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                title="Code"
                onClick={() => handleFormat('code')}
                className="p-1.5 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                title="List"
                onClick={() => handleFormat('list')}
                className="p-1.5 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-3">
              <textarea
                ref={messageInputRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none resize-none max-h-32 custom-scrollbar text-sm md:text-base leading-relaxed"
                onInput={e => {
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
            </div>

            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center space-x-2">
                <label className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors">
                  <Paperclip className="w-5 h-5" />
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
                <label className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors">
                  <ImageIcon className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={!socketConnected}
                className="p-2 rounded-lg bg-[#17E1FF] text-black hover:bg-[#17E1FF]/90 transition-all shadow-[0_0_10px_rgba(23,225,255,0.2)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Call Page */}
      <AnimatePresence>
        {activeCall?.type === 'audio' && (
          <AudioCallPage
            user={activeCall.user}
            isIncoming={activeCall.isIncoming}
            offer={activeCall.offer}
            onEnd={endCall}
          />
        )}
      </AnimatePresence>

      {/* Video Call Page */}
      <AnimatePresence>
        {activeCall?.type === 'video' && (
          <VideoCallPage
            user={activeCall.user}
            isIncoming={activeCall.isIncoming}
            offer={activeCall.offer}
            onEnd={endCall}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatSection;
