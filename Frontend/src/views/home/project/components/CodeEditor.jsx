import Editor from '@monaco-editor/react';
import { Code2, Copy, RotateCcw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  setLanguage,
  updateProjectCode,
  selectCurrentProjectCode,
  selectCurrentProjectLanguage,
} from '../../../../store/slices/projectSlice';
import { addToast } from '../../../../store/slices/uiSlice';

const CodeEditor = ({ projectId }) => {
  const dispatch = useAppDispatch();

  // Selectors - Using project-specific selectors
  const code = useAppSelector(selectCurrentProjectCode);
  const language = useAppSelector(selectCurrentProjectLanguage);
  const isDarkMode = useAppSelector(state => state.ui.isDarkMode);
  const socketConnected = useAppSelector(state => state.socket.connected);

  // Local state
  const [mobileInput, setMobileInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

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

  /* ========== INITIALIZE LANGUAGE ========== */
  useEffect(() => {
    if (!isInitialized) {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage && languages.find(l => l.value === savedLanguage)) {
        dispatch(setLanguage({ projectId, language: savedLanguage }));
      }
      setIsInitialized(true);
    }
  }, [isInitialized, projectId, dispatch]);

  /* ========== CODE CHANGE HANDLER ========== */
  const handleEditorChange = useCallback(
    value => {
      const newCode = value || '';

      // Update local state
      dispatch(updateProjectCode({ projectId, code: newCode }));

      // Broadcast to other users via socket
      if (socketConnected) {
        dispatch({
          type: 'socket/codeChange',
          payload: {
            projectId,
            code: newCode,
          },
        });
      }
    },
    [dispatch, projectId, socketConnected]
  );

  /* ========== LANGUAGE CHANGE HANDLER ========== */
  const changeLanguage = useCallback(
    newLanguage => {
      dispatch(setLanguage({ projectId, language: newLanguage }));

      const langConfig = languages.find(l => l.value === newLanguage);

      // Only set template if code is empty or has placeholder
      if (!code.trim() || code.includes('Write your code here') || code.includes('Write your')) {
        const templateCode = langConfig?.template || '// Write your code here...';
        dispatch(updateProjectCode({ projectId, code: templateCode }));

        if (socketConnected) {
          dispatch({
            type: 'socket/codeChange',
            payload: {
              projectId,
              code: templateCode,
            },
          });
        }
      }

      localStorage.setItem('selectedLanguage', newLanguage);
    },
    [dispatch, projectId, code, socketConnected]
  );

  /* ========== COPY CODE ========== */
  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      dispatch(
        addToast({
          message: 'Code copied to clipboard!',
          type: 'success',
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          message: 'Failed to copy code',
          type: 'error',
        })
      );
    }
  }, [code, dispatch]);

  /* ========== RESET CODE ========== */
  const resetCode = useCallback(() => {
    const langConfig = languages.find(l => l.value === language);
    const templateCode = langConfig?.template || '// Write your code here...';

    dispatch(updateProjectCode({ projectId, code: templateCode }));

    if (socketConnected) {
      dispatch({
        type: 'socket/codeChange',
        payload: {
          projectId,
          code: templateCode,
        },
      });
    }

    dispatch(
      addToast({
        message: 'Code reset to template',
        type: 'info',
      })
    );
  }, [dispatch, projectId, language, socketConnected]);

  /* ========== MOBILE CODE INPUT ========== */
  const handleMobileCodeSend = useCallback(() => {
    if (!mobileInput.trim()) return;

    const updatedCode = code + '\n' + mobileInput;
    dispatch(updateProjectCode({ projectId, code: updatedCode }));

    if (socketConnected) {
      dispatch({
        type: 'socket/codeChange',
        payload: {
          projectId,
          code: updatedCode,
        },
      });
    } else {
      dispatch(
        addToast({
          message: 'Code updated locally (offline)',
          type: 'warning',
        })
      );
    }

    setMobileInput('');
  }, [mobileInput, code, dispatch, projectId, socketConnected]);

  /* ========== RENDER ========== */
  return (
    <div
      className={`flex flex-col h-full rounded-lg overflow-hidden border ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex-shrink-0 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Code2 className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Code Editor
            </h2>
            {!socketConnected && (
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600">
                Offline
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyCode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Copy code"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={resetCode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Reset code"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <select
              value={language}
              onChange={e => changeLanguage(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
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

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          width="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: window.innerWidth > 768 },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnType: true,
            formatOnPaste: true,
            cursorBlinking: 'smooth',
            scrollBeyondLastLine: false,
            renderLineHighlight: 'all',
            smoothScrolling: true,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      {/* Mobile Input */}
      <div
        className={`lg:hidden p-4 border-t flex-shrink-0 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={mobileInput}
            onChange={e => setMobileInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleMobileCodeSend()}
            placeholder="Add code line..."
            className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
              isDarkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            autoComplete="off"
          />
          <button
            onClick={handleMobileCodeSend}
            disabled={!mobileInput.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
