// New: Frontend/src/views/home/project/components/CodeEditor.jsx
import Editor from '@monaco-editor/react';
import { Code2, Copy, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setLanguage, updateProjectCode } from '../../../../store/slices/projectSlice';
import { addToast } from '../../../../store/slices/uiSlice';

const CodeEditor = ({ activeSection, handleThemeToggle }) => {
  const dispatch = useAppDispatch();
  const code = useAppSelector(state => state.projects.currentProject?.code || '');
  const language = useAppSelector(state => state.projects.language);
  const isDarkMode = useAppSelector(state => state.ui.isDarkMode);
  const connected = useAppSelector(state => state.socket.connected);
  const [mobileInput, setMobileInput] = useState('');

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

  const handleEditorChange = value => {
    const newCode = value || '';
    dispatch(updateProjectCode(newCode));
    if (connected) {
      dispatch({ type: 'socket/codeChange', payload: newCode });
    }
  };

  const changeLanguage = newLanguage => {
    dispatch(setLanguage(newLanguage));
    const langConfig = languages.find(l => l.value === newLanguage);
    if (code.trim() === '' || code.includes('Write your code here')) {
      dispatch(updateProjectCode(langConfig?.template || '// Write your code here...'));
    }
    localStorage.setItem('selectedLanguage', newLanguage);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      dispatch(addToast({ message: 'Code copied to clipboard!', type: 'success' }));
    } catch (error) {
      dispatch(addToast({ message: 'Failed to copy code', type: 'error' }));
    }
  };

  const resetCode = () => {
    const langConfig = languages.find(l => l.value === language);
    dispatch(updateProjectCode(langConfig?.template || '// Write your code here...'));
    dispatch(addToast({ message: 'Code reset to template', type: 'info' }));
  };

  const handleMobileCodeSend = () => {
    if (!mobileInput.trim()) return;
    const updatedCode = code + '\n' + mobileInput;
    dispatch(updateProjectCode(updatedCode));
    if (connected) {
      dispatch({ type: 'socket/codeChange', payload: updatedCode });
    } else {
      dispatch(addToast({ message: 'Code updated locally (offline)', type: 'warning' }));
    }
    setMobileInput('');
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && languages.find(l => l.value === savedLanguage)) {
      changeLanguage(savedLanguage);
    }
  }, []);

  // const handleEditorChange = value => {
  //   const newCode = value || '';
  //   dispatch(setCode(newCode));
  //   if (connected) {
  //     dispatch({ type: 'socket/codeChange', payload: newCode });
  //   }
  // };

  // const changeLanguage = newLanguage => {
  //   dispatch(setLanguage(newLanguage));
  //   const langConfig = languages.find(l => l.value === newLanguage);
  //   if (code.trim() === '' || code.includes('Write your code here')) {
  //     dispatch(setCode(langConfig?.template || '// Write your code here...'));
  //   }
  //   localStorage.setItem('selectedLanguage', newLanguage);
  // };

  // const copyCode = async () => {
  //   try {
  //     await navigator.clipboard.writeText(code);
  //     dispatch(addToast({ message: 'Code copied to clipboard!', type: 'success' }));
  //   } catch (error) {
  //     dispatch(addToast({ message: 'Failed to copy code', type: 'error' }));
  //   }
  // };

  // const resetCode = () => {
  //   const langConfig = languages.find(l => l.value === language);
  //   dispatch(setCode(langConfig?.template || '// Write your code here...'));
  //   dispatch(addToast({ message: 'Code reset to template', type: 'info' }));
  // };

  // const handleMobileCodeSend = () => {
  //   if (!mobileInput.trim()) return;
  //   const updatedCode = code + '\n' + mobileInput;
  //   dispatch(setCode(updatedCode));
  //   if (connected) {
  //     dispatch({ type: 'socket/codeChange', payload: updatedCode });
  //   } else {
  //     dispatch(addToast({ message: 'Code updated locally (offline)', type: 'warning' }));
  //   }
  //   setMobileInput('');
  // };

  // useEffect(() => {
  //   const savedLanguage = localStorage.getItem('selectedLanguage');
  //   if (savedLanguage && languages.find(l => l.value === savedLanguage)) {
  //     changeLanguage(savedLanguage);
  //   }
  // }, []);

  return (
    <div
      className={`${
        activeSection === 'code' || window.innerWidth >= 1024 ? 'flex' : 'hidden'
      } lg:flex w-full lg:w-1/2 bg-gray-900 flex-col`}
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
  );
};

export default CodeEditor;
