// Updated ReviewPanel.jsx
// Use state.projects.currentProject?.review || ''
// Dispatch updateProjectReview
// Code and language from state

import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { updateProjectReview } from '../../../../store/slices/projectSlice';
import { addToast } from '../..//../../store/slices/uiSlice';

const ReviewPanel = ({ activeSection }) => {
  const dispatch = useAppDispatch();
  const review = useAppSelector(state => state.projects.currentProject?.review || '');
  const code = useAppSelector(state => state.projects.currentProject?.code || '');
  const language = useAppSelector(state => state.projects.language);
  const connected = useAppSelector(state => state.socket.connected);

  const getReview = () => {
    if (!code.trim()) {
      dispatch(addToast({ message: 'Please write some code first!', type: 'warning' }));
      return;
    }
    if (connected) {
      dispatch(updateProjectReview('*Analyzing your code... Please wait.*'));
      dispatch({ type: 'socket/getReview', payload: { code, language } });
    } else {
      const mockReview = `*Offline Review (Server Disconnected):\n\n**Code Analysis:**\n- Language: ${language}\n- Lines of code: ${code.split('\n').length}\n\n**Suggestions:**\n- Add comments for better readability\n- Consider error handling\n- Test your code thoroughly\n\n**Score:** 7/10\n\n*Connect to server for AI-powered analysis.*`;
      dispatch(updateProjectReview(mockReview));
      dispatch(addToast({ message: 'Using offline mock review', type: 'warning' }));
    }
  };

  return (
    <div
      className={`${
        activeSection === 'review' || window.innerWidth >= 1024 ? 'flex' : 'hidden'
      } lg:flex w-full lg:w-1/3 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col`}
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
  );
};

export default ReviewPanel;
