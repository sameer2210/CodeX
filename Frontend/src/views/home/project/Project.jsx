// import Editor from '@monaco-editor/react';
// import { Code2, Copy, MessageSquare, Phone, RotateCcw, Send, Sparkles, Video } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import ReactMarkdown from 'react-markdown';
// import { useParams } from 'react-router-dom';
// import { io as SocketIo } from 'socket.io-client';
// import { useTheme } from '../../../context/ThemeContext';

// const Project = () => {
//   const params = useParams();
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [mobileInput, setMobileInput] = useState('');
//   const [socket, setSocket] = useState(null);
//   const [code, setCode] = useState('// Write your code here...\n');
//   const [language, setLanguage] = useState('javascript');
//   const [review, setReview] = useState(
//     '*No review yet. Click **Generate Review** to get AI-powered code analysis and suggestions.*'
//   );
//   const { isDarkMode, toggleTheme } = useTheme();
//   const [activeSection, setActiveSection] = useState('chat');

//   const [activeUsers, setActiveUsers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(() => {
//     return (
//       localStorage.getItem('codex_username') || localStorage.getItem('username') || 'Anonymous'
//     );
//   });
//   const languages = [
//     {
//       value: 'javascript',
//       label: 'JavaScript',
//       template: '// Write your JavaScript code here\nconsole.log("Hello World!");',
//     },
//     {
//       value: 'typescript',
//       label: 'TypeScript',
//       template:
//         '// Write your TypeScript code here\nconst message: string = "Hello World!";\nconsole.log(message);',
//     },
//     {
//       value: 'python',
//       label: 'Python',
//       template: '# Write your Python code here\nprint("Hello World!")',
//     },
//     {
//       value: 'java',
//       label: 'Java',
//       template:
//         'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
//     },
//     {
//       value: 'csharp',
//       label: 'C#',
//       template:
//         'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello World!");\n    }\n}',
//     },
//     {
//       value: 'html',
//       label: 'HTML',
//       template:
//         '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>',
//     },
//     {
//       value: 'css',
//       label: 'CSS',
//       template:
//         '/* Write your CSS code here */\nbody {\n    font-family: Arial, sans-serif;\n    background-color: #f0f0f0;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}',
//     },
//     {
//       value: 'react',
//       label: 'React',
//       template:
//         'import React from "react";\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello World!</h1>\n    </div>\n  );\n}\n\nexport default App;',
//     },
//     {
//       value: 'vue',
//       label: 'Vue',
//       template:
//         '<template>\n  <div>\n    <h1>{{ message }}</h1>\n  </div>\n</template>\n\n<script>\nexport default {\n  data() {\n    return {\n      message: "Hello World!"\n    }\n  }\n}\n</script>',
//     },
//     {
//       value: 'php',
//       label: 'PHP',
//       template: '<?php\n// Write your PHP code here\necho "Hello World!";\n?>',
//     },
//   ];

//   const showToast = (message, type = 'info') => {
//     const toast = document.createElement('div');
//     toast.textContent = message;
//     const bgColors = {
//       success: 'bg-green-500',
//       error: 'bg-red-500',
//       warning: 'bg-yellow-500',
//       info: 'bg-blue-500',
//     };
//     toast.className = `fixed bottom-4 right-4 ${bgColors[type]} text-white px-4 py-2 rounded-lg z-50 animate-pulse shadow-lg`;
//     document.body.appendChild(toast);
//     setTimeout(() => document.body.removeChild(toast), 3000);
//   };

//   function handleEditorChange(value) {
//     setCode(value);
//     if (socket) {
//       socket.emit('code-change', value);
//     }
//   }

//   function handleUserMessage() {
//     if (!input.trim()) return;
//     setMessages(prev => [...prev, input]);
//     if (socket) {
//       socket.emit('chat-message', input);
//     }
//     setInput('');
//   }

//   function handleMobileCodeSend() {
//     if (!mobileInput.trim()) return;
//     const updatedCode = code + '\n' + mobileInput;
//     setCode(updatedCode);
//     if (socket) {
//       socket.emit('code-change', updatedCode);
//     }
//     setMobileInput('');
//   }

//   function getReview() {
//     if (!code.trim()) {
//       showToast('Please write some code first!', 'warning');
//       return;
//     }
//     if (socket && socket.connected) {
//       setReview('*Analyzing your code... Please wait.*');
//       socket.emit('get-review', code, language);
//     } else {
//       // Fallback mock review if disconnected
//       const mockReview = `*Mock Review (Server Disconnected):\n\n**Strengths:**\n- Code structure looks basic and functional.\n- Uses console.log for output.\n\n**Suggestions:**\n- Add error handling with try-catch.\n- Consider modularizing for larger projects.\n\n**Overall:** Good starting point! Server connection required for full AI analysis.`;
//       setReview(mockReview);
//       showToast('Server disconnected - showing mock review. Check server status.', 'warning');
//     }
//   }

//   function changeLanguage(newLanguage) {
//     const langConfig = languages.find(l => l.value === newLanguage);
//     setLanguage(newLanguage);

//     if (code.trim() === '' || code.includes('Write your code here')) {
//       setCode(langConfig?.template || '// Write your code here...');
//     }

//     localStorage.setItem('selectedLanguage', newLanguage);
//   }

//   // Simple call button handlers (navigation placeholders)
//   const handleVideoCall = () => {
//     console.log('Navigating to video call page...');
//     // Replace with your navigation: e.g., navigate(`/video-call/${params.id}`);
//     showToast('Opening video call...', 'info');
//   };

//   const handleAudioCall = () => {
//     console.log('Navigating to audio call page...');
//     // Replace with your navigation: e.g., navigate(`/audio-call/${params.id}`);
//     showToast('Opening audio call...', 'info');
//   };

//   const copyCode = async () => {
//     try {
//       await navigator.clipboard.writeText(code);
//       showToast('Code copied to clipboard!', 'success');
//     } catch (error) {
//       showToast('Failed to copy code', error);
//     }
//   };
//   const resetCode = () => {
//     const langConfig = languages.find(l => l.value === language);
//     setCode(langConfig?.template || '// Write your code here...');
//     showToast('Code reset to template', 'info');
//   };

//   useEffect(() => {
//     const io = SocketIo('https://ai-jlvm.onrender.com/', {
//       query: {
//         project: params.id,
//         user: currentUser,
//       },
//     });

//     io.on('connect', () => {
//       io.emit('join-project', {
//         user: currentUser,
//         projectId: params.id,
//       });
//     });
//     io.emit('chat-history');

//     io.on('active-users', users => {
//       setActiveUsers(users.filter(user => user !== currentUser));
//     });

//     // Socket event listeners
//     io.on('chat-history', messages => {
//       setMessages(
//         messages.map(message => ({
//           text: message.text || message,
//           user: message.user || 'Anonymous',
//           timestamp: message.timestamp || Date.now(),
//         }))
//       );
//     });

//     io.on('chat-message', message => {
//       setMessages(prev => [...prev, message]);
//     });

//     io.on('code-change', code => {
//       setCode(code);
//     });

//     io.on('project-code', code => {
//       setCode(code);
//     });

//     io.on('code-review', review => {
//       setReview(review);
//     });

//     io.on('user-joined', user => {
//       const message = {
//         text: `${user} joined the project`,
//         user: 'System',
//         timestamp: Date.now(),
//         type: 'system',
//       };
//       setMessages(prev => [...prev, message]);
//     });

//     io.on('user-left', user => {
//       const message = {
//         text: `${user} left the project`,
//         user: 'System',
//         timestamp: Date.now(),
//         type: 'system',
//       };
//       setMessages(prev => [...prev, message]);
//     });

//     io.emit('get-project-code');
//     setSocket(io);

//     return () => {
//       io.emit('leave-project', { user: currentUser });
//       io.disconnect();
//     };
//   }, [params.id, currentUser]);

//   return (
//     <div
//       className={`h-screen flex flex-col transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}
//     >
//       <header>
//         <div className="flex items-center justify-evenly">
//           {/* Mobile Navigation */}
//           <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
//             <div className="flex">
//               {[
//                 { id: 'chat', label: 'Chat', icon: MessageSquare },
//                 { id: 'code', label: 'Code', icon: Code2 },
//                 { id: 'review', label: 'Review', icon: Sparkles },
//               ].map(tab => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => {
//                       setActiveSection(tab.id);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center space-x-2 ${
//                       activeSection === tab.id
//                         ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
//                         : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
//                     } transition-colors`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     <span>{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Chat Section */}
//         <div
//           className={`${activeSection === 'chat' || window.innerWidth >= 1024 ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}
//         >
//           <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
//             <div className="flex items-center space-x-2">
//               <MessageSquare className="w-5 h-5 text-blue-500" />
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chater</h2>
//               <div className="hidden md:flex items-center space-x-2 ml-8">
//                 <span
//                   className={`px-3 py-1 text-sm rounded-full ${
//                     socket && socket.connected
//                       ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
//                       : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
//                   }`}
//                 >
//                   {socket && socket.connected ? '● Connected' : '● Disconnected'}
//                 </span>
//               </div>
//               {/* Simple Call Buttons */}
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={handleVideoCall}
//                   className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                   title="Start video call"
//                 >
//                   <Video className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={handleAudioCall}
//                   className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                   title="Start audio call"
//                 >
//                   <Phone className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Messages Area */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-3">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex ${message.type === 'user' && message.user === currentUser ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
//                     message.type === 'system'
//                       ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-center text-xs mx-auto'
//                       : message.type === 'error'
//                         ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
//                         : message.user === currentUser
//                           ? 'bg-blue-500 text-white'
//                           : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
//                   } transition-colors shadow-sm`}
//                 >
//                   {message.type !== 'system' && (
//                     <div
//                       className={`text-xs mb-1 ${message.user === currentUser ? 'opacity-75' : 'opacity-60'}`}
//                     >
//                       {message.user}
//                     </div>
//                   )}
//                   <p className="text-sm break-words">{message.text}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyPress={e => e.key === 'Enter' && handleUserMessage()}
//                 placeholder="message to project..."
//                 className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
//               />
//               <button
//                 onClick={handleUserMessage}
//                 className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
//               >
//                 <Send className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Code Editor Section */}
//         <div
//           className={`${activeSection === 'code' || window.innerWidth >= 1024 ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/2 bg-gray-900 flex-col`}
//         >
//           <div className="p-4 border-b border-gray-700 flex-shrink-0">
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center space-x-2">
//                 <Code2 className="w-5 h-5 text-green-400" />
//                 <h2 className="text-lg font-semibold text-white">Code Editor</h2>
//               </div>
//               <button
//                 onClick={copyCode}
//                 className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
//                 title="Copy code"
//               >
//                 <Copy className="w-4 h-4" />
//               </button>
//               <button onClick={toggleTheme}>
//                 {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
//               </button>
//               <button
//                 onClick={resetCode}
//                 className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
//                 title="Reset code"
//               >
//                 <RotateCcw className="w-4 h-4" />
//               </button>

//               <select
//                 value={language}
//                 onChange={e => changeLanguage(e.target.value)}
//                 className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 text-sm"
//               >
//                 {languages.map(lang => (
//                   <option key={lang.value} value={lang.value}>
//                     {lang.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="flex-1 relative">
//             <Editor
//               height="100%"
//               width="100%"
//               language={language}
//               value={code}
//               onChange={handleEditorChange}
//               theme="vs-dark"
//               options={{
//                 minimap: { enabled: true },
//                 fontSize: 14,
//                 wordWrap: 'on',
//                 automaticLayout: true,
//                 formatOnType: true,
//                 formatOnPaste: true,
//                 cursorBlinking: 'smooth',
//               }}
//             />
//           </div>

//           {/* Mobile Code Input */}
//           <div className="lg:hidden p-4 border-t border-gray-700 flex-shrink-0">
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 value={mobileInput}
//                 onChange={e => setMobileInput(e.target.value)}
//                 placeholder="Write code here (mobile input)..."
//                 className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm"
//               />
//               <button
//                 onClick={handleMobileCodeSend}
//                 className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
//               >
//                 Send Code
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Review Section */}
//         <div
//           className={`${activeSection === 'review' || window.innerWidth >= 1024 ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/3 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col`}
//         >
//           <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <Sparkles className="w-5 h-5 text-purple-500" />
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Review</h2>
//               </div>
//               <button
//                 onClick={getReview}
//                 disabled={!code.trim()}
//                 className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-200 shadow-sm"
//               >
//                 Generate Review
//               </button>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto p-4">
//             <div className="prose prose-sm dark:prose-invert max-w-none">
//               <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
//                 <ReactMarkdown>{review}</ReactMarkdown>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Project;





import Editor from '@monaco-editor/react';
import { Code2, Copy, MessageSquare, Phone, RotateCcw, Send, Sparkles, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import { io as SocketIo } from 'socket.io-client';
import { useTheme } from '../../../context/ThemeContext';

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
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeUsers, setActiveUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    return (
      localStorage.getItem('codex_username') || localStorage.getItem('username') || 'Anonymous'
    );
  });

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

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    const bgColors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
    };
    toast.className = `fixed bottom-4 right-4 ${bgColors[type]} text-white px-4 py-2 rounded-lg z-50 animate-pulse shadow-lg`;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  function handleEditorChange(value) {
    setCode(value || '');
    if (socket && socket.connected) {
      socket.emit('code-change', value);
    }
  }





  function handleUserMessage() {
    if (!input.trim()) return;

    const newMessage = {
      text: input.trim(),
      user: currentUser,
      timestamp: Date.now(),
      type: 'user',
    };

    setMessages(prev => [...prev, newMessage]);

    if (socket && socket.connected) {
      socket.emit('chat-message', newMessage);
    } else {
      // Mock offline message
      setTimeout(() => {
        const offlineMsg = {
          text: 'Server offline - message queued locally.',
          user: 'System',
          timestamp: Date.now(),
          type: 'system',
        };
        setMessages(prev => [...prev, offlineMsg]);
      }, 500);
    }
    setInput('');
  }

  function handleMobileCodeSend() {
    if (!mobileInput.trim()) return;
    const updatedCode = code + '\n' + mobileInput;
    setCode(updatedCode);
    if (socket && socket.connected) {
      socket.emit('code-change', updatedCode);
    }
    setMobileInput('');
  }

  function getReview() {
    if (!code.trim()) {
      showToast('Please write some code first!', 'warning');
      return;
    }
    if (socket && socket.connected) {
      setReview('*Analyzing your code... Please wait.*');
      socket.emit('get-review', code, language);
    } else {
      // Enhanced mock review for offline
      const mockReview = `*Offline Review (Server Disconnected):\n\n**Strengths:**\n- Basic structure is present.\n- Syntax appears valid.\n\n**Suggestions:**\n- Add comments for clarity.\n- Test with real data.\n\n**Score:** 7/10\n\n*Reconnect to server for full AI analysis.*`;
      setReview(mockReview);
      showToast('Server offline - using local mock review.', 'warning');
    }
  }

  function changeLanguage(newLanguage) {
    const langConfig = languages.find(l => l.value === newLanguage);
    setLanguage(newLanguage);

    if (code.trim() === '' || code.includes('Write your code here')) {
      setCode(langConfig?.template || '// Write your code here...');
    }

    localStorage.setItem('selectedLanguage', newLanguage);
  }

  // Simple call button handlers (navigation placeholders)
  const handleVideoCall = () => {
    console.log('Navigating to video call page...');
    // Replace with your navigation: e.g., navigate(`/video-call/${params.id}`);
    showToast('Opening video call...', 'info');
  };

  const handleAudioCall = () => {
    console.log('Navigating to audio call page...');
    // Replace with your navigation: e.g., navigate(`/audio-call/${params.id}`);
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

  useEffect(() => {
    if (!params.id) return;

    const io = SocketIo('https://ai-jlvm.onrender.com/', {
      query: {
        project: params.id,
        user: currentUser,
      },
      transports: ['websocket', 'polling'], // Prefer WS, fallback to polling
      reconnectionAttempts: 5, // Limit retries to avoid spam
      timeout: 20000, // 20s timeout
    });

    io.on('connect', () => {
      console.log('Socket connected!');
      io.emit('join-project', {
        user: currentUser,
        projectId: params.id,
      });
      // Add connection status message
      const connectMsg = {
        text: 'Connected to server!',
        user: 'System',
        timestamp: Date.now(),
        type: 'system',
      };
      setMessages(prev => [...prev, connectMsg]);
    });

    io.on('connect_error', error => {
      console.error('Socket connection error:', error);
      const errorMsg = {
        text: 'Connection failed - check server status.',
        user: 'System',
        timestamp: Date.now(),
        type: 'error',
      };
      setMessages(prev => [...prev, errorMsg]);
    });

    io.on('disconnect', () => {
      console.log('Socket disconnected');
      const disconnectMsg = {
        text: 'Server disconnected - retrying...',
        user: 'System',
        timestamp: Date.now(),
        type: 'error',
      };
      setMessages(prev => [...prev, disconnectMsg]);
    });

    io.emit('chat-history');

    io.on('active-users', users => {
      setActiveUsers(users.filter(user => user !== currentUser));
    });

    // Socket event listeners
    io.on('chat-history', messages => {
      setMessages(
        messages.map(message => ({
          text: message.text || message,
          user: message.user || 'Anonymous',
          timestamp: message.timestamp || Date.now(),
          type: message.type || 'user',
        }))
      );
    });

    io.on('chat-message', message => {
      setMessages(prev => [...prev, message]);
    });

    io.on('code-change', code => {
      setCode(code || '');
    });

    io.on('project-code', code => {
      setCode(code || '');
    });

    io.on('code-review', review => {
      setReview(review || 'No review available');
    });

    io.on('user-joined', user => {
      const message = {
        text: `${user} joined the project`,
        user: 'System',
        timestamp: Date.now(),
        type: 'system',
      };
      setMessages(prev => [...prev, message]);
    });

    io.on('user-left', user => {
      const message = {
        text: `${user} left the project`,
        user: 'System',
        timestamp: Date.now(),
        type: 'system',
      };
      setMessages(prev => [...prev, message]);
    });

    io.emit('get-project-code');
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
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    socket && socket.connected
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  {socket && socket.connected ? '● Connected' : '● Offline'}
                </span>
              </div>
              {/* Simple Call Buttons */}
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

          {/* Messages Area - Scrollbar Hidden */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {messages.map((message, index) => (
              <div
                key={index}
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
                onKeyPress={e => e.key === 'Enter' && handleUserMessage()}
                placeholder="Message to project..."
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
                  onClick={toggleTheme}
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