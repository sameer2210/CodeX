// src/components/project/components/OutputPanel.jsx
import { AlertTriangle, Terminal } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectExecutionError,
  selectExecutionOutput,
  selectIsExecuting,
} from '../../../../store/slices/projectSlice';

const OutputPanel = () => {
  const { isDarkMode } = useTheme();
  const output = useAppSelector(selectExecutionOutput);
  const error = useAppSelector(selectExecutionError);
  const isExecuting = useAppSelector(selectIsExecuting);
  const consoleRef = useRef(null);

  // Auto scroll to bottom on new output
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output, error, isExecuting]);

  const renderConsole = () => {
    if (isExecuting) return '[ RUNNING... ]\n\n';

    if (error) {
      return `[ ERROR ]\n${error}`;
    }

    if (!output) {
      return 'Program output will appear here...';
    }

    return output;
  };

  return (
    <div
      className={`h-full flex flex-col rounded-2xl border backdrop-blur-xl ${
        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-black/15'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <Terminal className="w-5 h-5 text-[#17E1FF]" />
        <h3 className="text-sm font-semibold tracking-wide">Execution Console</h3>
        {error && <AlertTriangle className="w-4 h-4 text-red-400 ml-auto" />}
      </div>

      {/* Console */}
      <div
        ref={consoleRef}
        className="flex-1 p-4 overflow-auto font-mono text-sm leading-relaxed text-green-400 bg-black/70 rounded-b-2xl"
      >
        <pre className="whitespace-pre-wrap">{renderConsole()}</pre>
      </div>
    </div>
  );
};

export default OutputPanel;

