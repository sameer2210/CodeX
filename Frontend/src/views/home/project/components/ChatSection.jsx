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
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../../../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  selectCurrentProjectActiveUsers,
  selectCurrentProjectMessages,
  selectCurrentProjectTypingUsers,
} from '../../../../store/slices/projectSlice';

const ChatSection = ({ projectId, onStartCall, onStartGroupCall }) => {
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

  // --- Refs ---
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const userListRef = useRef(null);
  const userListButtonRef = useRef(null);

  /* ========== UTILS ========== */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, attachments]);

  useEffect(() => {
    if (!showUserList) return;

    const handleClickOutside = event => {
      const target = event.target;
      if (userListRef.current?.contains(target)) return;
      if (userListButtonRef.current?.contains(target)) return;
      setShowUserList(false);
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showUserList]);

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

    const newCursorPos = start + prefix.length + selected.length;
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
    }, 0);
  };

  /* ========== CALL HANDLERS ========== */
  const startCall = (type, targetUser) => {
    if (!targetUser || targetUser === 'Team') {
      console.warn('Team calls not yet supported');
      return;
    }

    console.log(`Starting ${type} call with ${targetUser}`);
    onStartCall?.(type, targetUser);
  };

  const startGroupCall = type => {
    if (activeUsers.length === 0) return;
    if (activeUsers.length === 1) {
      startCall(type, activeUsers[0]);
      return;
    }
    console.log(`Starting ${type} group call with ${activeUsers.length} users`);
    onStartGroupCall?.(type, activeUsers);
  };

  /* ========== MESSAGE RENDERING ========== */
  const renderMessage = (msg, index) => {
    const isCurrentUser = msg.username === currentUser;
    const isSystem = msg.type === 'system';

    if (isSystem) {
      return (
        <div key={index} className="flex justify-center my-4">
          <span
            className={`text-xs px-3 py-1 rounded-full border ${
              isDarkMode
                ? 'bg-white/5 text-gray-400 border-white/10'
                : 'bg-black/5 text-slate-500 border-black/10'
            }`}
          >
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
            <span
              className={`text-xs font-medium mb-1 ml-1 ${
                isDarkMode ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              {msg.username}
            </span>
          )}
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
              isCurrentUser
                ? isDarkMode
                  ? 'bg-[#1f2933] text-white rounded-br-sm'
                  : 'bg-[#0B0E11] text-white rounded-br-sm'
                : isDarkMode
                  ? 'bg-[#111418] text-gray-200 rounded-bl-sm border border-white/5'
                  : 'bg-white text-[#0B0E11] rounded-bl-sm border border-black/5 shadow-sm'
            }`}
          >
            <ReactMarkdown
              className={`max-w-none ${
                isDarkMode
                  ? 'prose prose-invert prose-headings:text-white prose-a:text-[#17E1FF] prose-code:text-pink-300 prose-pre:bg-black/30'
                  : 'prose prose-slate prose-headings:text-slate-900 prose-a:text-[#0B7EA1] prose-code:text-rose-600 prose-pre:bg-slate-100'
              }`}
            >
              {msg.message}
            </ReactMarkdown>
          </div>
          <span
            className={`text-[10px] mt-1 px-1 opacity-70 group-hover:opacity-100 transition-opacity ${
              isDarkMode ? 'text-gray-600' : 'text-slate-400'
            }`}
          >
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
        className={`flex flex-col h-full min-h-0 relative overflow-hidden ${
          isDarkMode ? 'bg-[#0B0E12] text-[#E6E8E5]' : 'bg-[#F4F6F8] text-[#0B0E11]'
        }`}
      >
        {/* Background Ambience */}
        <div
          className={`absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ${
            isDarkMode ? 'bg-[#17E1FF] opacity-[0.03]' : 'bg-[#17E1FF] opacity-[0.08]'
          }`}
        />

        {/* HEADER */}
        <div
          className={`flex items-center justify-between shrink-0 px-4 sm:px-6 py-4 border-b backdrop-blur-md z-20 sticky top-0 ${
            isDarkMode ? 'border-white/10 bg-[#0B0E12]/85' : 'border-black/10 bg-white/85'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Users className={` ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`} />

              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${
                  isDarkMode ? 'border-[#0B0E12]' : 'border-white'
                } ${socketConnected ? 'border-[#17E1FF]' : 'border-rose-500'}`}
              />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#17E1FF]">Project Room</p>
              <h2 className="font-semibold tracking-wide">Team Chat</h2>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                {activeUsers.length + 1} members active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => startGroupCall('audio')}
              disabled={activeUsers.length === 0}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? 'border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                  : 'border-black/10 text-slate-600 hover:text-black hover:bg-black/5'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden md:inline text-xs font-semibold">Audio</span>
            </button>
            <button
              onClick={() => startGroupCall('video')}
              disabled={activeUsers.length === 0}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? 'border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                  : 'border-black/10 text-slate-600 hover:text-black hover:bg-black/5'
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="hidden md:inline text-xs font-semibold">Video</span>
            </button>
            <button
              onClick={() => setShowUserList(!showUserList)}
              ref={userListButtonRef}
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode
                  ? 'border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                  : 'border-black/10 text-slate-600 hover:text-black hover:bg-black/5'
              } ${showUserList ? (isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black') : ''}`}
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
              ref={userListRef}
              className={`absolute top-20 right-6 w-64 rounded-xl shadow-2xl z-20 overflow-hidden border ${
                isDarkMode ? 'bg-[#111418] border-white/10' : 'bg-white border-black/10'
              }`}
            >
              <div className="p-3">
                <h3
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${
                    isDarkMode ? 'text-gray-500' : 'text-slate-500'
                  }`}
                >
                  Active Members
                </h3>
                <div className="space-y-1">
                  {/* You */}
                  <div
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isDarkMode ? 'bg-white/5' : 'bg-black/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#17E1FF]/10 flex items-center justify-center text-[#17E1FF] text-xs font-bold">
                        {currentUser?.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}
                      >
                        You
                      </span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  </div>

                  {/* Others */}
                  {activeUsers.map(user => (
                    <div
                      key={user}
                      className={`flex items-center justify-between p-2 rounded-lg group transition-colors ${
                        isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                            isDarkMode
                              ? 'bg-gray-800 text-gray-400 border-white/5'
                              : 'bg-slate-100 text-slate-500 border-black/5'
                          }`}
                        >
                          {user.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`text-sm group-hover:text-white ${
                            isDarkMode ? 'text-gray-300' : 'text-slate-700 group-hover:text-black'
                          }`}
                        >
                          {user}
                        </span>
                      </div>
                      <div className="flex space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startCall('audio', user)}
                          className={`relative z-10 p-1.5 rounded-md transition-colors ${
                            isDarkMode
                              ? 'text-gray-300 hover:text-[#17E1FF] hover:bg-white/10'
                              : 'text-slate-500 hover:text-[#17E1FF] hover:bg-black/5'
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => startCall('video', user)}
                          className={`relative z-10 p-1.5 rounded-md transition-colors ${
                            isDarkMode
                              ? 'text-gray-300 hover:text-[#17E1FF] hover:bg-white/10'
                              : 'text-slate-500 hover:text-[#17E1FF] hover:bg-black/5'
                          }`}
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

        {/* MESSAGES AREA */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 custom-scrollbar overscroll-contain">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  isDarkMode ? 'bg-white/5' : 'bg-black/5'
                }`}
              >
                <Send className={`${isDarkMode ? 'text-gray-400' : 'text-slate-400'} w-8 h-8`} />
              </div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'} font-light`}>
                Start the conversation
              </p>
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
        <div
          className={`px-4 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shrink-0 sticky bottom-0 z-20 backdrop-blur-md border-t ${
            isDarkMode ? 'bg-[#0B0E12]/95 border-white/10' : 'bg-white/90 border-black/10'
          }`}
        >
          {attachments.length > 0 && (
            <div className="flex space-x-3 mb-3 overflow-x-auto pb-2 custom-scrollbar">
              {attachments.map(file => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group flex-shrink-0"
                >
                  <div
                    className={`w-20 h-20 rounded-lg border flex items-center justify-center overflow-hidden ${
                      isDarkMode ? 'bg-[#1C1F26] border-white/10' : 'bg-white border-black/10'
                    }`}
                  >
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Code
                          className={`w-6 h-6 mb-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}
                        />
                        <span
                          className={`text-[9px] uppercase ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}
                        >
                          {file.name.split('.').pop()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setAttachments(prev => prev.filter(a => a.id !== file.id))}
                    className={`absolute -top-2 -right-2 border rounded-full p-1 shadow-md transition-colors ${
                      isDarkMode
                        ? 'bg-[#1C1F26] border-white/10 text-gray-400 hover:text-red-500'
                        : 'bg-white border-black/10 text-slate-500 hover:text-rose-500'
                    }`}
                  >
                    <Circle className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <div
            className={`relative rounded-xl border focus-within:border-white/20 ${
              isDarkMode ? 'bg-[#111418] border-white/10' : 'bg-white border-black/10'
            }`}
          >
            <div
              className={`flex items-center px-4 py-2 border-b space-x-1 ${
                isDarkMode ? 'border-white/5' : 'border-black/5'
              }`}
            >
              <button
                title="Bold"
                onClick={() => handleFormat('bold')}
                className={`p-1.5 rounded transition-colors ${
                  isDarkMode
                    ? 'hover:bg-white/5 text-gray-500 hover:text-white'
                    : 'hover:bg-black/5 text-slate-500 hover:text-black'
                }`}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                title="Italic"
                onClick={() => handleFormat('italic')}
                className={`p-1.5 rounded transition-colors ${
                  isDarkMode
                    ? 'hover:bg-white/5 text-gray-500 hover:text-white'
                    : 'hover:bg-black/5 text-slate-500 hover:text-black'
                }`}
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                title="Strikethrough"
                onClick={() => handleFormat('strikethrough')}
                className={`p-1.5 rounded transition-colors ${
                  isDarkMode
                    ? 'hover:bg-white/5 text-gray-500 hover:text-white'
                    : 'hover:bg-black/5 text-slate-500 hover:text-black'
                }`}
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                title="Code"
                onClick={() => handleFormat('code')}
                className={`p-1.5 rounded transition-colors ${
                  isDarkMode
                    ? 'hover:bg-white/5 text-gray-500 hover:text-white'
                    : 'hover:bg-black/5 text-slate-500 hover:text-black'
                }`}
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                title="List"
                onClick={() => handleFormat('list')}
                className={`p-1.5 rounded transition-colors ${
                  isDarkMode
                    ? 'hover:bg-white/5 text-gray-500 hover:text-white'
                    : 'hover:bg-black/5 text-slate-500 hover:text-black'
                }`}
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
                className={`w-full bg-transparent focus:outline-none resize-none max-h-32 custom-scrollbar text-sm md:text-base leading-relaxed ${
                  isDarkMode
                    ? 'text-gray-200 placeholder-gray-600'
                    : 'text-slate-800 placeholder-slate-400'
                }`}
                onInput={e => {
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
            </div>

            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center space-x-2">
                <label
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isDarkMode
                      ? 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-black/5 text-slate-500 hover:text-black'
                  }`}
                >
                  <Paperclip className="w-5 h-5" />
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
                <label
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isDarkMode
                      ? 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-black/5 text-slate-500 hover:text-black'
                  }`}
                >
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
                className="p-2 rounded-lg bg-[#17E1FF] text-black hover:bg-[#17E1FF]/90 transition-all shadow-[0_0_10px_rgba(23,225,255,0.2)] disabled:opacity-60"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSection;
