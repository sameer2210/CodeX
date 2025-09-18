
import Editor from '@monaco-editor/react';
import { Code2, Copy, MessageSquare, Phone, RotateCcw, Send, Sparkles, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import { io as SocketIo } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateProjectCode, updateProjectReview } from '../../../store/slices/projectSlice';
import { 
  setConnectionStatus, 
  setIsConnecting, 
  addMessage, 
  setMessages,
  addToast,
  toggleTheme
} from '../../../store/slices/uiSlice';

const Project = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [socket, setSocket] = useState(null);
  const params = useParams();
  const dispatch = useAppDispatch();
  
  const { currentProject } = useAppSelector(state => state.projects);
  const { connectionStatus, isConnecting, messages, isDarkMode } = useAppSelector(state => state.ui);
  const { user } = useAppSelector(state => state.auth);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const showToast = (message, type = 'info') => {
    dispatch(addToast({ message, type }));
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
    dispatch(updateProjectCode(value || ''));
    if (socket && socket.connected) {
      socket.emit('code-change', value);
    }
  };

  const getReview = () => {
    if (!code.trim()) {
      showToast('Please write some code first!', 'warning');
      return;
    }
    if (socket && socket.connected && connectionStatus === 'connected') {
      dispatch(updateProjectReview('*Analyzing your code... Please wait.*'));
      socket.emit('get-review', { code, language });
    } else {
      const mockReview = `*Offline Review (Server Disconnected):\n\n**Code Analysis:**\n- Language: ${language}\n- Lines of code: ${code.split('\n').length}\n\n**Suggestions:**\n- Add comments for better readability\n- Consider error handling\n- Test your code thoroughly\n\n**Score:** 7/10\n\n*Connect to server for AI-powered analysis.*`;
      dispatch(updateProjectReview(mockReview));
      showToast('Using offline mock review', 'warning');
    }
  };

  const languages = [
    {
      value: 'javascript',
      label: 'JavaScript',
      template: '// Write your JavaScript code here\nconsole.log("Hello World!");',
    },
    {
      value: 'typescript',
      label: 'TypeScript',
      template:
        '// Write your TypeScript code here\nconst message: string = "Hello World!";\nconsole.log(message);',
    },
    {
      value: 'python',
      label: 'Python',
      template: '# Write your Python code here\nprint("Hello World!")',
    },
    {
      value: 'java',
      label: 'Java',
      template:
        'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
    },
    {
      value: 'csharp',
      label: 'C#',
      template:
        'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello World!");\n    }\n}',
    },
    {
      value: 'html',
      label: 'HTML',
      template:
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>',
    },
    {
      value: 'css',
      label: 'CSS',
      template:
        '/* Write your CSS code here */\nbody {\n    font-family: Arial, sans-serif;\n    background-color: #f0f0f0;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}',
    },
    {
      value: 'react',
      label: 'React',
      template:
        'import React from "react";\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello World!</h1>\n    </div>\n  );\n}\n\nexport default App;',
    },
    {
      value: 'vue',
      label: 'Vue',
      template:
        '<template>\n  <div>\n    <h1>{{ message }}</h1>\n  </div>\n</template>\n\n<script>\nexport default {\n  data() {\n    return {\n      message: "Hello World!"\n    }\n  }\n}\n</script>',
    },
    {
      value: 'php',
      label: 'PHP',
      template: '<?php\n// Write your PHP code here\necho "Hello World!";\n?>',
    },
  ];

  function handleUserMessage() {
    if (!input.trim()) return;

    const newMessage = {
      text: input.trim(),
      user: currentUser,
      timestamp: Date.now(),
      type: 'user',
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    };

    if (socket && socket.connected && connectionStatus === 'connected') {
      // Only emit to server when connected - server will broadcast back
      socket.emit('chat-message', newMessage);
    } else {
      // Add message locally when offline
      setMessages(prev => [...prev, newMessage]);

      // Show offline message
      setTimeout(() => {
        const offlineMsg = {
          text: 'Server offline - message stored locally.',
          user: 'System',
          timestamp: Date.now(),
          type: 'system',
          id: 'offline_' + Date.now(),
        };
        setMessages(prev => [...prev, offlineMsg]);
      }, 300);
    }
    setInput('');
  }

  // Fixed handleMobileCodeSend function
  function handleMobileCodeSend() {
    if (!mobileInput.trim()) return;

    const updatedCode = code + '\n' + mobileInput;

    if (socket && socket.connected && connectionStatus === 'connected') {
      // Let server handle code updates
      socket.emit('code-change', updatedCode);
    } else {
      // Update locally when offline
      setCode(updatedCode);
      showToast('Code updated locally (offline)', 'warning');
    }

    setMobileInput('');
  }

  function changeLanguage(newLanguage) {
    const langConfig = languages.find(l => l.value === newLanguage);
    setLanguage(newLanguage);

    if (code.trim() === '' || code.includes('Write your code here')) {
      setCode(langConfig?.template || '// Write your code here...');
    }

    localStorage.setItem('selectedLanguage', newLanguage);
  }

  const handleVideoCall = () => {
    console.log('Navigating to video call page...');
    showToast('Opening video call...', 'info');
  };

  const handleAudioCall = () => {
    console.log('Navigating to audio call page...');
    showToast('Opening audio call...', 'info');
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Code copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy code:', error);
      showToast('Failed to copy code', 'error');
    }
  };

  const resetCode = () => {
    const langConfig = languages.find(l => l.value === language);
    setCode(langConfig?.template || '// Write your code here...');
    showToast('Code reset to template', 'info');
  };

  // Enhanced socket connection with better error handling
  useEffect(() => {
    if (!params.id) return;

    setIsConnecting(true);
    setConnectionStatus('connecting');

    // Clean up previous connection
    if (socket) {
      socket.disconnect();
    }

    const socketOptions = {
      query: {
        project: params.id,
        user: currentUser,
      },
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
      forceNew: true,
    };

    const io = SocketIo(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', socketOptions);

    io.on('connect', () => {
      console.log('Socket connected successfully!');
      setConnectionStatus('connected');
      setIsConnecting(false);

      io.emit('join-project', {
        user: currentUser,
        projectId: params.id,
      });

      const connectMsg = {
        text: 'Successfully connected to server!',
        user: 'System',
        timestamp: Date.now(),
        type: 'system',
        id: 'connect_' + Date.now(),
      };
      setMessages(prev => [...prev, connectMsg]);
      showToast('Connected to server', 'success');
    });

    io.on('connect_error', error => {
      console.error('Socket connection error:', error);
      setConnectionStatus('error');
      setIsConnecting(false);

      const errorMsg = {
        text: `Connection failed: ${error.message}. Working in offline mode.`,
        user: 'System',
        timestamp: Date.now(),
        type: 'error',
        id: 'error_' + Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      showToast('Connection failed - working offline', 'error');
    });

    io.on('disconnect', reason => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('disconnected');

      const disconnectMsg = {
        text: `Disconnected: ${reason}. Attempting to reconnect...`,
        user: 'System',
        timestamp: Date.now(),
        type: 'error',
        id: 'disconnect_' + Date.now(),
      };
      setMessages(prev => [...prev, disconnectMsg]);
    });

    io.on('reconnect', attemptNumber => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setConnectionStatus('connected');
      showToast('Reconnected to server', 'success');
    });

    io.on('reconnect_error', error => {
      console.error('Reconnection failed:', error);
      setConnectionStatus('error');
    });

    // Socket event listeners
    io.on('chat-history', messages => {
      if (Array.isArray(messages)) {
        const formattedMessages = messages.map((message, index) => ({
          text: message.text || message,
          user: message.user || 'Anonymous',
          timestamp: message.timestamp || Date.now() - (messages.length - index) * 1000,
          type: message.type || 'user',
          id: message.id || 'history_' + index,
        }));
        setMessages(formattedMessages);
      }
    });

    io.on('chat-message', message => {
      const formattedMessage = {
        text: message.text,
        user: message.user,
        timestamp: message.timestamp || Date.now(),
        type: message.type || 'user',
        id: message.id || Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      };

      setMessages(prev => {
        // Prevent duplicate messages
        const exists = prev.some(
          msg =>
            msg.id === formattedMessage.id ||
            (msg.text === formattedMessage.text &&
              msg.user === formattedMessage.user &&
              Math.abs(msg.timestamp - formattedMessage.timestamp) < 2000)
        );

        return exists ? prev : [...prev, formattedMessage];
      });
    });

    io.on('code-change', newCode => {
      if (typeof newCode === 'string') {
        setCode(newCode);
      }
    });

    io.on('project-code', projectCode => {
      if (typeof projectCode === 'string') {
        setCode(projectCode);
      }
    });

    io.on('code-review', reviewText => {
      setReview(reviewText || 'No review available');
    });

    io.on('active-users', users => {
      if (Array.isArray(users)) {
        setActiveUsers(users.filter(user => user !== currentUser));
      }
    });

    io.on('user-joined', user => {
      const message = {
        text: `${user} joined the project`,
        user: 'System',
        timestamp: Date.now(),
        type: 'system',
        id: 'join_' + Date.now(),
      };
      setMessages(prev => [...prev, message]);
    });

    io.on('user-left', user => {
      const message = {
        text: `${user} left the project`,
        user: 'System',
        timestamp: Date.now(),
        type: 'system',
        id: 'leave_' + Date.now(),
      };
      setMessages(prev => [...prev, message]);
    });

    // Request initial data
    setTimeout(() => {
      io.emit('chat-history');
      io.emit('get-project-code');
    }, 1000);

    setSocket(io);

    return () => {
      io.emit('leave-project', { user: currentUser });
      io.disconnect();
    };
  }, [params.id, currentUser]);

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && languages.find(l => l.value === savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Get connection status display
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          text: '● Connected',
          className: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        };
      case 'connecting':
        return {
          text: '● Connecting...',
          className: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        };
      case 'error':
        return {
          text: '● Connection Error',
          className: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        };
      default:
        return {
          text: '● Offline',
          className: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
        };
    }
  };

  const statusDisplay = getConnectionStatusDisplay();

  return (
    <div
      className={`h-screen flex flex-col transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}
    >
      <header>
        <div className="flex items-center justify-evenly">
          {/* Mobile Navigation */}
          <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex">
              {[
                { id: 'chat', label: 'Chat', icon: MessageSquare },
                { id: 'code', label: 'Code', icon: Code2 },
                { id: 'review', label: 'Review', icon: Sparkles },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveSection(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center space-x-2 ${
                      activeSection === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    } transition-colors`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div
          className={`${activeSection === 'chat' || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}
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
              {/* Call Buttons */}
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

          {/* Messages Area */}
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

          {/* Message Input */}
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

        {/* Code Editor Section */}
        <div
          className={`${activeSection === 'code' || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/2 bg-gray-900 flex-col`}
        >
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Code Editor</h2>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={copyCode}
                  className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                  title="Copy code"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={handleThemeToggle}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  {isDarkMode ? 'Light' : 'Dark'}
                </button>

                <button
                  onClick={resetCode}
                  className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                  title="Reset code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <select
                  value={language}
                  onChange={e => changeLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              width="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: window.innerWidth > 768 },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                formatOnType: true,
                formatOnPaste: true,
                cursorBlinking: 'smooth',
              }}
            />
          </div>

          {/* Mobile Code Input */}
          <div className="lg:hidden p-4 border-t border-gray-700 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={mobileInput}
                onChange={e => setMobileInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleMobileCodeSend()}
                placeholder="Add code line..."
                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
                autoComplete="off"
              />
              <button
                onClick={handleMobileCodeSend}
                disabled={!mobileInput.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div
          className={`${activeSection === 'review' || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/3 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Review</h2>
              </div>
              <button
                onClick={getReview}
                disabled={!code.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-200 shadow-sm"
              >
                Generate Review
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <ReactMarkdown>{review}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
