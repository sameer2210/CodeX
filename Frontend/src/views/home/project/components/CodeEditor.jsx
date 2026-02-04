// src/views/home/project/components/CodeEditor.jsx
import Editor from '@monaco-editor/react';
import {
  Code2,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Settings,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProjectCode } from '../../../../api/project.api';
import { useTheme } from '../../../../context/ThemeContext';
import { notify } from '../../../../lib/notify';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  executeProjectCode,
  selectCurrentProjectCode,
  selectCurrentProjectLanguage,
  selectIsExecuting,
  setLanguage,
  updateProjectCode,
} from '../../../../store/slices/projectSlice';

const CodeEditor = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Selectors
  const code = useAppSelector(selectCurrentProjectCode);
  const language = useAppSelector(selectCurrentProjectLanguage);
  const { isDarkMode } = useTheme();
  const socketConnected = useAppSelector(state => state.socket.connected);
  const isExecuting = useAppSelector(selectIsExecuting);

  // Local state
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    minimap: window.innerWidth > 768,
    lineNumbers: true,
    wordWrap: 'on',
    formatOnPaste: true,
    autoComplete: true,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const languages = [
    {
      value: 'javascript',
      label: 'JavaScript',
      template: '// JavaScript\nconsole.log("Hello World!");',
    },
    {
      value: 'typescript',
      label: 'TypeScript',
      template: '// TypeScript\nconst message: string = "Hello World!";\nconsole.log(message);',
    },
    { value: 'python', label: 'Python', template: '# Python\nprint("Hello World!")' },
    {
      value: 'java',
      label: 'Java',
      template:
        'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
    },
    {
      value: 'cpp',
      label: 'C++',
      template:
        '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!" << endl;\n    return 0;\n}',
    },
    {
      value: 'c',
      label: 'C',
      template:
        '#include <stdio.h>\n\nint main() {\n    printf("Hello World!\\n");\n    return 0;\n}',
    },
    {
      value: 'go',
      label: 'Go',
      template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World!")\n}',
    },
    {
      value: 'rust',
      label: 'Rust',
      template: 'fn main() {\n    println!("Hello World!");\n}',
    },
    { value: 'php', label: 'PHP', template: '<?php\necho "Hello World!";\n?>' },
    { value: 'ruby', label: 'Ruby', template: '# Ruby\nputs "Hello World!"' },
  ];

  /* ========== RESPONSIVE HANDLING ========== */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setEditorSettings(prev => ({ ...prev, minimap: !mobile }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ========== INITIALIZE LANGUAGE + CODE (ONE TIME) ========== */
  useEffect(() => {
    if (isInitialized) return;

    const defaultLang = localStorage.getItem('selectedLanguage') || 'javascript';
    const langConfig = languages.find(l => l.value === defaultLang);

    dispatch(setLanguage({ projectId, language: defaultLang }));

    if (!code?.trim()) {
      dispatch(
        updateProjectCode({
          projectId,
          code: langConfig?.template || '// Write your code here...',
        })
      );

      if (socketConnected) {
        dispatch({
          type: 'socket/codeChange',
          payload: {
            projectId,
            code: langConfig?.template || '',
          },
        });
      }
    }

    setIsInitialized(true);
  }, [isInitialized, projectId, dispatch, code, socketConnected]);

  /* ========== EDITOR MOUNT ========== */
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Enhanced editor configuration
    editor.updateOptions({
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      wordBasedSuggestions: true,
      parameterHints: { enabled: true },
      hover: { enabled: true },
      contextmenu: true,
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      notify({ message: 'Code saved!', type: 'success' });
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      executeCode();
    });
  };

  /* ========== CODE CHANGE HANDLER ========== */
  const handleEditorChange = useCallback(
    value => {
      const newCode = value || '';

      // 1. Instant UI update (Redux)
      dispatch(updateProjectCode({ projectId, code: newCode }));

      // 2. Real-time collaboration
      if (socketConnected) {
        dispatch({
          type: 'socket/codeChange',
          payload: { projectId, code: newCode },
        });
      }

      // 3. Debounced DB autosave
      setTimeout(async () => {
        await saveProjectCode(projectId, newCode);
      }, 1000);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await saveProjectCode(projectId, newCode);
          setIsSaving(false);
          console.log(' Auto-saved');
        } catch (err) {
          setIsSaving(false);
          console.error('Auto-save failed', err);
        }
      }, 1000);
    },
    [dispatch, projectId, socketConnected]
  );

  /* ========== CODE EXECUTION ========== */

  const executeCode = () => {
    if (language !== 'javascript') {
      notify({ message: 'Only JavaScript execution is supported currently', type: 'warning' });
      return;
    }

    if (!code.trim()) {
      notify({ message: 'Please write some code first!', type: 'warning' });
      return;
    }
    dispatch(executeProjectCode({ projectId, code, language }));
  };

  /* ========== LANGUAGE CHANGE ========== */
  const changeLanguage = useCallback(
    newLanguage => {
      const langConfig = languages.find(l => l.value === newLanguage);
      dispatch(setLanguage({ projectId, language: newLanguage }));

      const templateCode = langConfig?.template || '// Write your code here...';
      dispatch(updateProjectCode({ projectId, code: templateCode }));

      if (socketConnected) {
        dispatch({
          type: 'socket/codeChange',
          payload: { projectId, code: templateCode },
        });
      }

      localStorage.setItem('selectedLanguage', newLanguage);
    },
    [dispatch, projectId, socketConnected]
  );

  /* ========== UTILITY FUNCTIONS ========== */
  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      notify({ message: 'Code copied!', type: 'success' });
    } catch (error) {
      notify({ message: 'Failed to copy', type: 'error' });
    }
  }, [code]);

  const resetCode = useCallback(() => {
    const langConfig = languages.find(l => l.value === language);
    const templateCode = langConfig?.template || '// Write your code here...';
    dispatch(updateProjectCode({ projectId, code: templateCode }));

    if (socketConnected) {
      dispatch({
        type: 'socket/codeChange',
        payload: { projectId, code: templateCode },
      });
    }
    notify({ message: 'Code reset', type: 'info' });
  }, [dispatch, projectId, language, socketConnected]);

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
    notify({ message: 'Code downloaded!', type: 'success' });
  };

  const formatCode = async () => {
    if (!editorRef.current) return;

    try {
      await editorRef.current.getAction('editor.action.formatDocument').run();

      // Get formatted value from editor
      const formattedCode = editorRef.current.getValue();

      // Sync Redux
      dispatch(updateProjectCode({ projectId, code: formattedCode }));

      // Save backend
      await saveProjectCode(projectId, formattedCode);

      notify({ message: 'Code formatted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      notify({ message: 'Formatting failed', type: 'error' });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const updateEditorSettings = (key, value) => {
    setEditorSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      if (editorRef.current) {
        editorRef.current.updateOptions({
          fontSize: newSettings.fontSize,
          minimap: { enabled: newSettings.minimap },
          lineNumbers: newSettings.lineNumbers ? 'on' : 'off',
          wordWrap: newSettings.wordWrap,
        });
      }
      return newSettings;
    });
  };

  /* ========== RENDER ========== */
  return (
    <div
      className={`flex flex-col h-full rounded-lg overflow-hidden border ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Header */}
      <div className={`p-3 md:p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2 md:mb-3 gap-2 flex-wrap">
          <div className="flex items-center space-x-2">
            <Code2
              className={`w-4 h-4 md:w-5 md:h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
            />
            <h2
              onClick={() => navigate('/dashboard')}
              className={`text-base cursor-pointer md:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              CodeX Editor
            </h2>
            {isSaving && <span className="text-xs text-yellow-400 ml-2">Saving…</span>}
            {!socketConnected && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600">
                Offline
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Mobile-optimized buttons */}
            <button
              onClick={executeCode}
              disabled={isExecuting || language !== 'javascript'}
              className={`p-2 rounded-lg transition-all ${
                isExecuting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              } text-white`}
              title="Run Code (Ctrl+Enter)"
            >
              {isExecuting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            {!isMobile && (
              <>
                <button
                  onClick={copyCode}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadCode}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={formatCode}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title="Format"
                >
                  <Code2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={resetCode}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <select
              value={language}
              onChange={e => changeLanguage(e.target.value)}
              className={`px-2 md:px-3 py-1.5 md:py-2 border rounded-lg text-xs md:text-sm ${
                isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
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

        {/* Settings Panel */}
        {showSettings && (
          <div
            className={`mt-3 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editorSettings.minimap}
                  onChange={e => updateEditorSettings('minimap', e.target.checked)}
                  className="rounded"
                />
                <span>Minimap</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editorSettings.lineNumbers}
                  onChange={e => updateEditorSettings('lineNumbers', e.target.checked)}
                  className="rounded"
                />
                <span>Line Numbers</span>
              </label>
              <label className="flex items-center space-x-2">
                <span>Font Size:</span>
                <input
                  type="number"
                  value={editorSettings.fontSize}
                  onChange={e => updateEditorSettings('fontSize', parseInt(e.target.value))}
                  min="10"
                  max="24"
                  className={`w-16 px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          options={{
            ...editorSettings,
            minimap: { enabled: editorSettings.minimap },
            lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
            wordWrap: editorSettings.wordWrap,
            automaticLayout: true,
            formatOnType: true,
            formatOnPaste: editorSettings.formatOnPaste,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 10, bottom: 10 },
            suggestOnTriggerCharacters: true,
            quickSuggestions: editorSettings.autoComplete,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
