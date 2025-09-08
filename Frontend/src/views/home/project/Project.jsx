import Editor from '@monaco-editor/react';
import { Code2, Menu, MessageSquare, Moon, Send, Sparkles, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import { io as SocketIo } from 'socket.io-client';

const Project = () => {
  const params = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState('// Write your code here...\n');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState(
    '*No review yet. Click **Generate Review** to get AI-powered code analysis and suggestions.*'
  );
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('chat');

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
  ];

  function handleEditorChange(value) {
    setCode(value);
    if (socket) {
      socket.emit('code-change', value);
    }
  }

  function handleUserMessage() {
    if (!input.trim()) return;
    setMessages(prev => [...prev, input]);
    if (socket) {
      socket.emit('chat-message', input);
    }
    setInput('');
  }

  function handleMobileCodeSend() {
    if (!mobileInput.trim()) return;
    const updatedCode = code + '\n' + mobileInput;
    setCode(updatedCode);
    if (socket) {
      socket.emit('code-change', updatedCode);
    }
    setMobileInput('');
  }

  function getReview() {
    if (socket) {
      socket.emit('get-review', code);
    }
  }

  function changeLanguage(newLanguage) {
    setLanguage(newLanguage);
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const io = SocketIo('https://ai-jlvm.onrender.com/', {
      query: {
        project: params.id,
      },
    });

    io.emit('chat-history');

    io.on('chat-history', messages => {
      setMessages(messages.map(message => message.text));
    });

    io.on('chat-message', message => {
      setMessages(prev => [...prev, message]);
    });

    io.on('code-change', code => {
      setCode(code);
    });

    io.on('project-code', code => {
      setCode(code);
    });

    io.on('code-review', review => {
      setReview(review);
    });

    io.emit('get-project-code');
    setSocket(io);

    return () => {
      io.disconnect();
    };
  }, [params.id]);

  return (
    <div
      className={`h-screen flex flex-col transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Code Editor</h1>
            <div className="hidden md:flex items-center space-x-2 ml-8">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  socket && socket.connected
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}
              >
                {socket && socket.connected ? '● Connected' : '● Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
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
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div
          className={`${activeSection === 'chat' || window.innerWidth >= 1024 ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
              <div
                className={`w-2 h-2 rounded-full ${
                  socket && socket.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}
              ></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                  <p className="text-sm">{message}</p>
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
                onKeyPress={e => e.key === 'Enter' && handleUserMessage()}
                placeholder="message to project..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <button
                onClick={handleUserMessage}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor Section */}
        <div
          className={`${activeSection === 'code' || window.innerWidth >= 1024 ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/2 bg-gray-900 flex-col`}
        >
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Code Editor</h2>
              </div>
            </div>

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

          <div className="flex-1 relative">
            <Editor
              height="100%"
              width="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
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
                placeholder="Write code here (mobile input)..."
                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
              />
              <button
                onClick={handleMobileCodeSend}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
              >
                Send Code
              </button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div
          className={`${activeSection === 'review' || window.innerWidth >= 1024 ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/3 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Review</h2>
              </div>
              <button
                onClick={getReview}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm rounded-lg transition-all duration-200"
              >
                get-review
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
