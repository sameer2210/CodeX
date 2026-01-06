import { Sparkles, RefreshCw } from 'lucide-react';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  updateProjectReview,
  selectCurrentProjectCode,
  selectCurrentProjectReview,
  selectCurrentProjectLanguage,
} from '../../../../store/slices/projectSlice';
import { addToast } from '../../../../store/slices/uiSlice';

const ReviewPanel = ({ projectId }) => {
  const dispatch = useAppDispatch();

  // Selectors - Using project-specific selectors
  const review = useAppSelector(selectCurrentProjectReview);
  const code = useAppSelector(selectCurrentProjectCode);
  const language = useAppSelector(selectCurrentProjectLanguage);
  const socketConnected = useAppSelector(state => state.socket.connected);
  const isDarkMode = useAppSelector(state => state.ui.isDarkMode);

  // Local state
  const [isGenerating, setIsGenerating] = useState(false);

  /* ========== GENERATE REVIEW ========== */
  const getReview = useCallback(async () => {
    if (!code.trim()) {
      dispatch(
        addToast({
          message: 'Please write some code first!',
          type: 'warning',
        })
      );
      return;
    }

    setIsGenerating(true);

    try {
      if (socketConnected) {
        // Show loading message
        dispatch(
          updateProjectReview({
            projectId,
            review:
              '🔄 **Analyzing your code with AI...**\n\nPlease wait while our AI reviews your code. This may take a few moments.',
          })
        );

        // Request AI review via socket
        dispatch({
          type: 'socket/getReview',
          payload: {
            projectId,
            code,
            language,
          },
        });

        dispatch(
          addToast({
            message: 'AI review in progress...',
            type: 'info',
          })
        );
      } else {
        // Offline mock review
        const mockReview = generateOfflineReview(code, language);
        dispatch(updateProjectReview({ projectId, review: mockReview }));

        dispatch(
          addToast({
            message: 'Using offline mock review (server disconnected)',
            type: 'warning',
          })
        );
      }
    } catch (error) {
      dispatch(
        updateProjectReview({
          projectId,
          review:
            '❌ **Error generating review**\n\nAn error occurred while analyzing your code. Please try again.',
        })
      );

      dispatch(
        addToast({
          message: 'Failed to generate review',
          type: 'error',
        })
      );
    } finally {
      // Reset loading state after a delay
      setTimeout(() => setIsGenerating(false), 1000);
    }
  }, [code, language, socketConnected, dispatch, projectId]);

  /* ========== GENERATE OFFLINE REVIEW ========== */
  const generateOfflineReview = (codeText, lang) => {
    const lines = codeText.split('\n').length;
    const chars = codeText.length;
    const hasComments =
      codeText.includes('//') || codeText.includes('/*') || codeText.includes('#');

    return `## 📊 Offline Code Analysis

**⚠️ Server Disconnected** - Using basic analysis

###  Code Statistics
- **Language:** ${lang.charAt(0).toUpperCase() + lang.slice(1)}
- **Lines of Code:** ${lines}
- **Characters:** ${chars}
- **Has Comments:** ${hasComments ? '✅ Yes' : '❌ No'}

### 💡 Quick Suggestions
${hasComments ? '- ✅ Good: Code includes comments' : '- ⚠️ Add comments to explain complex logic'}
-  Consider adding error handling
-  Test your code thoroughly
-  Follow ${lang} best practices

###  Estimated Quality Score
**${Math.min(Math.max(Math.floor(chars / 100 + (hasComments ? 2 : 0)), 3), 10)}/10**

---
*💡 Connect to server for AI-powered analysis with detailed feedback.*`;
  };

  /* ========== CLEAR REVIEW ========== */
  const clearReview = useCallback(() => {
    dispatch(
      updateProjectReview({
        projectId,
        review: '',
      })
    );

    dispatch(
      addToast({
        message: 'Review cleared',
        type: 'info',
      })
    );
  }, [dispatch, projectId]);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Code Review
            </h2>
            {!socketConnected && (
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600">
                Offline
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {review && (
              <button
                onClick={clearReview}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Clear review"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={getReview}
              disabled={!code.trim() || isGenerating}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                !code.trim() || isGenerating
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Generate Review'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {review ? (
          <div className={`prose prose-sm max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
            <ReactMarkdown
              components={{
                // Custom styling for markdown elements
                h1: ({ node, ...props }) => (
                  <h1
                    className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className={`mb-3 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className={`list-disc list-inside mb-3 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className={`list-decimal list-inside mb-3 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    {...props}
                  />
                ),
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <code
                      className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                        isDarkMode ? 'bg-gray-800 text-purple-400' : 'bg-gray-100 text-purple-600'
                      }`}
                      {...props}
                    />
                  ) : (
                    <code
                      className={`block p-3 rounded-lg text-sm font-mono overflow-x-auto ${
                        isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}
                      {...props}
                    />
                  ),
                pre: ({ node, ...props }) => (
                  <pre
                    className={`rounded-lg p-4 mb-3 overflow-x-auto ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong
                    className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className={`border-l-4 pl-4 italic my-3 ${
                      isDarkMode
                        ? 'border-purple-500 text-gray-400'
                        : 'border-purple-600 text-gray-600'
                    }`}
                    {...props}
                  />
                ),
              }}
            >
              {review}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}
            >
              <Sparkles
                className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
              />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              No Review Yet
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Write some code and click "Generate Review" to get AI-powered feedback
            </p>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <p>💡 AI will analyze:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Code quality & best practices</li>
                <li>Potential bugs & improvements</li>
                <li>Security considerations</li>
                <li>Performance optimization tips</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPanel;
