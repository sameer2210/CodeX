import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SignalIcon,
  SignalSlashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from '../layout/Sidebar';

const EASE = [0.22, 1, 0.36, 1];

// --- BUILT-IN SOUND SYNTHESIZER ---
const playSound = type => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  if (type === 'send') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'receive') {
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  }
};

const PLACEHOLDERS = [
  'Ask me why the chicken crossed the road...',
  'Summoning digital demons...',
  "Type something intelligent (or don't)...",
  'Calculating the meaning of life...',
  'Beep boop? Beep boop!',
];

const Help = () => {
  const { isDarkMode } = useTheme();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 0,
      sender: 'bot',
      text: 'Hello, human! I am the AI of CodeX. How can I help you today?',
      seed: 'bot-start',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const idRef = useRef(1);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  const cyclePlaceholder = () => {
    const random = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
    setPlaceholder(random);
  };

  // Resize handling for layout
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.matchMedia('(min-width: 1024px)').matches);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('ai-response', data => {
      playSound('receive');
      const text = data?.response || data?.message || JSON.stringify(data || '');
      setMessages(m => [
        ...m,
        {
          id: idRef.current++,
          sender: 'bot',
          text,
          seed: Math.random().toString(),
        },
      ]);
      setSending(false);
    });
    newSocket.on('connect_error', () => {
      setConnected(false);
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Mock response if socket is not connected for demo purposes
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    playSound('send');
    setMessages(m => [
      ...m,
      {
        id: idRef.current++,
        sender: 'user',
        text,
        seed: 'user',
      },
    ]);
    setInput('');
    setSending(true);
    cyclePlaceholder();

    if (socket && connected) {
      socket.emit('ai-message', text);
    } else {
      // Simulation for when backend is offline
      setTimeout(() => {
        playSound('receive');
        setMessages(m => [
          ...m,
          {
            id: idRef.current++,
            sender: 'bot',
            text: `I'm currently in offline demo mode since I can't reach the server. You said: "${text}". Try running the backend server!`,
            seed: Math.random().toString(),
          },
        ]);
        setSending(false);
      }, 1500);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 relative flex ${
        isDarkMode ? 'bg-[#0B0E11] text-[#E6E8E5]' : 'bg-[#E6E8E5] text-[#0B0E11]'
      }`}
    >
      {/* Background Effects */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />
      <div
        className={`fixed inset-0 pointer-events-none z-[1] ${isDarkMode ? 'opacity-[0.02]' : 'opacity-[0.01]'}`}
        style={{
          backgroundImage: isDarkMode
            ? 'linear-gradient(#E6E8E5 1px, transparent 1px), linear-gradient(90deg, #E6E8E5 1px, transparent 1px)'
            : 'linear-gradient(#0B0E11 1px, transparent 1px), linear-gradient(90deg, #0B0E11 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      {/* Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <motion.main
        animate={{
          marginLeft: isLargeScreen ? (isSidebarCollapsed ? 80 : 256) : 0,
        }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative z-10 flex-1 p-4 sm:p-6 lg:p-12 min-h-screen flex flex-col"
      >
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <ChatBubbleLeftRightIcon className="w-8 h-8" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/50'}`}>
                Operational support & intelligent assistance.
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded border text-xs font-bold uppercase tracking-wider transition-colors ${
              connected
                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            {connected ? (
              <SignalIcon className="w-4 h-4" />
            ) : (
              <SignalSlashIcon className="w-4 h-4" />
            )}
            {connected ? 'System Online' : 'System Offline'}
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto">
          {/* Messages Area */}
          <div
            className={`flex-1 overflow-y-auto mb-6 p-4 sm:p-6 rounded border backdrop-blur-2xl transition-all h-[60vh] custom-scrollbar ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'
            }`}
          >
            <div className="flex flex-col gap-6">
              {messages.map(m => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m.id}
                  className={`flex items-end gap-4 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded flex-shrink-0 border-2 overflow-hidden ${
                      m.sender === 'user'
                        ? 'border-[#17E1FF] shadow-[0_0_10px_rgba(23,225,255,0.3)]'
                        : isDarkMode
                          ? 'border-white/20'
                          : 'border-black/10'
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${m.sender === 'user' ? 'Felix' : m.seed}`}
                      alt="avatar"
                      className="w-full h-full bg-black/10"
                    />
                  </div>

                  <div
                    className={`max-w-[80%] p-4 rounded text-sm font-medium leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#17E1FF] text-[#0B0E11] rounded-br-none'
                        : isDarkMode
                          ? 'bg-white/10 text-[#E6E8E5] rounded-bl-none'
                          : 'bg-white text-[#0B0E11] rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {sending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-end gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded flex-shrink-0 border-2 overflow-hidden ${isDarkMode ? 'border-white/20' : 'border-black/10'}`}
                  >
                    <img
                      src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=thinking"
                      alt="thinking"
                      className="w-full h-full bg-black/10"
                    />
                  </div>
                  <div
                    className={`p-4 rounded rounded-bl-none flex gap-1 ${
                      isDarkMode ? 'bg-white/10' : 'bg-white'
                    }`}
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className={`w-2 h-2 rounded ${isDarkMode ? 'bg-white/50' : 'bg-black/40'}`}
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className={`w-2 h-2 rounded ${isDarkMode ? 'bg-white/50' : 'bg-black/40'}`}
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className={`w-2 h-2 rounded ${isDarkMode ? 'bg-white/50' : 'bg-black/40'}`}
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div
            className={`p-2 rounded border backdrop-blur-2xl flex items-center gap-2 ${
              isDarkMode
                ? 'bg-white/5 border-white/10 focus-within:border-[#17E1FF]/50'
                : 'bg-white/80 border-[#0B0E11]/10 focus-within:border-[#17E1FF]/50'
            }`}
          >
            <div
              className={`p-3 rounded ${isDarkMode ? 'bg-black/20 text-[#17E1FF]' : 'bg-black/5 text-[#17E1FF]'}`}
            >
              <SparklesIcon className="w-6 h-6" />
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={cyclePlaceholder}
              placeholder={placeholder}
              rows={1}
              className={`flex-1 bg-transparent border-none outline-none resize-none py-3 px-2 text-sm font-medium ${
                isDarkMode ? 'text-white placeholder-white/30' : 'text-black placeholder-black/40'
              }`}
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="p-3 bg-[#17E1FF] text-[#0B0E11] rounded hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5 -rotate-45 translate-x-0.5 -translate-y-0.5" />
            </button>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Help;
