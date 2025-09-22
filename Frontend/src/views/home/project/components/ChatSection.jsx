// Updated ChatSection.jsx

import { MessageSquare, Phone, Send, Video } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { useState } from 'react';

const ChatSection = ({ activeSection, handleVideoCall, handleAudioCall }) => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.projects.messages);
  const isDarkMode = useAppSelector(state => state.ui.isDarkMode);
  const connected = useAppSelector(state => state.socket.connected);
  const error = useAppSelector(state => state.socket.error);
  const isConnecting = useAppSelector(state => state.socket.isConnecting);
  const currentUser = useAppSelector(state => state.auth.user?.username || 'Anonymous');
  const [input, setInput] = useState('');

  let statusDisplay = {
    text: '● Offline',
    className: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
  };
  if (connected) {
    statusDisplay = {
      text: '● Connected',
      className: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    };
  } else if (error) {
    statusDisplay = {
      text: '● Connection Error',
      className: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    };
  } else if (isConnecting) {
    statusDisplay = {
      text: '● Connecting...',
      className: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    };
  }

  const handleUserMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      text: input.trim(),
      user: currentUser,
      timestamp: Date.now(),
      type: 'user',
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    };

    if (connected) {
      dispatch({ type: 'socket/sendChatMessage', payload: newMessage });
    } else {
      dispatch(addChatMessage(newMessage));
      const offlineMsg = {
        text: 'Server offline - message stored locally.',
        user: 'System',
        timestamp: Date.now(),
        type: 'system',
        id: 'offline_' + Date.now(),
      };
      dispatch(addChatMessage(offlineMsg));
    }
    setInput('');
  };

  return (
    <div
      className={`${activeSection === 'chat' || window.innerWidth >= 1024 ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h2>
          <div className="hidden md:flex items-center space-x-2 ml-4">
            <span className={`px-3 py-1 text-sm rounded-full ${statusDisplay.className}`}>
              {statusDisplay.text}
            </span>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={handleVideoCall}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Start video call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={handleAudioCall}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Start audio call"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.type === 'user' && message.user === currentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'system'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-center text-xs mx-auto'
                  : message.type === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : message.user === currentUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              } transition-colors shadow-sm`}
            >
              {message.type !== 'system' && (
                <div
                  className={`text-xs mb-1 ${message.user === currentUser ? 'opacity-75' : 'opacity-60'}`}
                >
                  {message.user}
                </div>
              )}
              <p className="text-sm break-words">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleUserMessage()}
            placeholder="Message to project..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isConnecting}
            autoComplete="off"
          />
          <button
            onClick={handleUserMessage}
            disabled={!input.trim() || isConnecting}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
