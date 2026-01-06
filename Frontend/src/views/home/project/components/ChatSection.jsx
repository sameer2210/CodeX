import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Circle, MessageSquare, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  selectCurrentProjectMessages,
  selectCurrentProjectActiveUsers,
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

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

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

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
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

  /* ========== MESSAGE RENDERING ========== */

  const formatTime = timestamp => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // This week
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Older
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
            className={`text-xs px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-200 text-gray-600'
            }`}
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
        <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
          {!isCurrentUser && (
            <div className="text-xs font-medium mb-1 px-1 text-blue-500">{msg.username}</div>
          )}
          <div
            className={`px-4 py-2 rounded-2xl ${
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
            className={`text-xs mt-1 px-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            } ${isCurrentUser ? 'text-right' : 'text-left'}`}
          >
            {formatTime(msg.createdAt)}
          </div>
        </div>
      </motion.div>
    );
  };

  /* ========== TYPING INDICATOR ========== */

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
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
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
      className={`flex flex-col h-full ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      } rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          <MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Team Chat
          </h3>
        </div>

        <div className="flex items-center space-x-3">
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
                  className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-10 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="p-2">
                    <div
                      className={`text-xs font-semibold mb-2 px-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Active Users
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`flex items-center space-x-2 px-2 py-1.5 rounded ${
                          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                        }`}
                      >
                        <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                        <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {currentUser} (You)
                        </span>
                      </div>
                      {activeUsers.map((user, i) => (
                        <div
                          key={i}
                          className={`flex items-center space-x-2 px-2 py-1.5 rounded ${
                            isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                          <span
                            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {user}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-1">
            <Circle
              className={`w-2 h-2 ${
                socketConnected ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <MessageSquare
              className={`w-12 h-12 mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}
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
      <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            ref={messageInputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={socketConnected ? 'Type a message...' : 'Connecting...'}
            disabled={!socketConnected}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSection;
