import { Copy, Download, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  selectCurrentProjectCode,
  selectCurrentProjectLanguage,
  selectCurrentProjectReview,
  updateProjectReview,
} from '../../../../store/slices/projectSlice';
import { notify } from '../../../../lib/notify';
import { useTheme } from '../../../../context/ThemeContext';

const ReviewPanel = ({ projectId }) => {
  const dispatch = useAppDispatch();

  // Selectors
  const review = useAppSelector(selectCurrentProjectReview);
  const code = useAppSelector(selectCurrentProjectCode);
  const language = useAppSelector(selectCurrentProjectLanguage);
  const socketConnected = useAppSelector(state => state.socket.connected);
  const { isDarkMode, toggleTheme } = useTheme();

  // Local state
  const [isGenerating, setIsGenerating] = useState(false);

  /* ========== GENERATE REVIEW ========== */
  const getReview = useCallback(async () => {
    if (!code.trim()) {
      notify({ message: 'Please write some code first!', type: 'warning' });
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

        // Request AI review via socket - CORRECTED: Added language parameter
        dispatch({
          type: 'socket/getReview',
          payload: {
            projectId,
            code,
            language,
          },
        });

        notify({ message: 'AI review requested...', type: 'info' });

        // Set timeout to reset generating state
        setTimeout(() => {
          setIsGenerating(false);
        }, 15000); // 15 second timeout
      } else {
        // Offline mock review
        const mockReview = generateOfflineReview(code, language);
        dispatch(updateProjectReview({ projectId, review: mockReview }));
        notify({
          message: 'Using offline analysis (server disconnected)',
          type: 'warning',
        });
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Review error:', error);
      dispatch(
        updateProjectReview({
          projectId,
          review:
            '❌ **Error generating review**\n\nAn error occurred while analyzing your code. Please try again.',
        })
      );
      notify({ message: 'Failed to generate review', type: 'error' });
      setIsGenerating(false);
    }
  }, [code, language, socketConnected, dispatch, projectId]);

  /* ========== GENERATE OFFLINE REVIEW ========== */
  const generateOfflineReview = (codeText, lang) => {
    const lines = codeText.split('\n').length;
    const chars = codeText.length;
    const hasComments =
      codeText.includes('//') || codeText.includes('/*') || codeText.includes('#');
    const hasFunctions = /function|def |func |fn |const \w+\s*=|let \w+\s*=/.test(codeText);
    const hasLoops = /for|while|forEach|map/.test(codeText);
    const hasConditionals = /if|else|switch|case/.test(codeText);

    const complexityScore =
      (hasComments ? 2 : 0) +
      (hasFunctions ? 2 : 0) +
      (hasLoops ? 1 : 0) +
      (hasConditionals ? 1 : 0) +
      Math.min(Math.floor(lines / 20), 2);

    const qualityScore = Math.min(Math.max(complexityScore, 3), 10);

    return `##  Code Analysis Report

** Server Disconnected** - Using basic offline analysis

### Code Statistics
- **Language:** ${lang.charAt(0).toUpperCase() + lang.slice(1)}
- **Lines of Code:** ${lines}
- **Characters:** ${chars}
- **Has Comments:** ${hasComments ? 'Yes' : 'No'}
- **Has Functions:** ${hasFunctions ? 'Yes' : 'No'}
- **Has Loops:** ${hasLoops ? 'Yes' : '❌ No'}
- **Has Conditionals:** ${hasConditionals ? 'Yes' : 'No'}

### Strengths
${hasComments ? '- Good: Code includes comments for clarity' : ''}
${hasFunctions ? '- Good: Code is modular with functions' : ''}
${hasLoops ? '- Good: Uses iteration constructs' : ''}
${hasConditionals ? '- Good: Includes conditional logic' : ''}

### Suggestions
${!hasComments ? '- Add comments to explain complex logic' : ''}
${!hasFunctions ? '- Consider breaking code into reusable functions' : ''}
- Implement error handling and input validation
- Add documentation for better maintainability
- Consider writing ut tests
- Follow ${lang} best practices and style guides

### Quality Score
**${qualityScore}/10** - ${qualityScore >= 7 ? 'Good' : qualityScore >= 5 ? 'Fair' : 'Needs Improvement'}

### Resources
- Review ${lang} best practices
- Consider code linting tools
- Add comprehensive error handling

---
*💡 Connect to server for AI-powered analysis with detailed feedback from Google Gemini.*`;
  };

  /* ========== UTILITY FUNCTIONS ========== */
  const clearReview = useCallback(() => {
    dispatch(updateProjectReview({ projectId, review: '' }));
    notify({ message: 'Review cleared', type: 'info' });
  }, [dispatch, projectId]);

  const copyReview = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(review);
      notify({ message: 'Review copied to clipboard!', type: 'success' });
    } catch (error) {
      notify({ message: 'Failed to copy review', type: 'error' });
    }
  }, [review]);

  const downloadReview = useCallback(() => {
    const blob = new Blob([review], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    notify({ message: 'Review downloaded!', type: 'success' });
  }, [review]);

  /* ========== RENDER ========== */
  return (
    <div
      className={`flex flex-col h-full rounded-lg overflow-hidden border ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header */}
      <div className={`p-3 md:p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles
              className={`w-4 h-4 md:w-5 md:h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
            />
            <h2
              className={`text-base md:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              AI Code Review
            </h2>
            {!socketConnected && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600">
                Offline
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {review && (
              <>
                <button
                  onClick={copyReview}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Copy review"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadReview}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Download review"
                >
                  <Download className="w-4 h-4" />
                </button>
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
              </>
            )}

            <button
              onClick={getReview}
              disabled={!code.trim() || isGenerating}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 shadow-sm ${
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
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {review ? (
          <div
            className={`prose prose-sm md:prose-base max-w-none ${isDarkMode ? 'prose-invert' : ''}`}
          >
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className={`text-xl md:text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className={`text-lg md:text-xl font-bold mb-3 mt-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className={`text-base md:text-lg font-semibold mb-2 mt-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className={`mb-3 leading-relaxed text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className={`list-disc list-inside mb-3 space-y-1 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className={`list-decimal list-inside mb-3 space-y-1 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    {...props}
                  />
                ),
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <code
                      className={`px-1.5 py-0.5 rounded text-xs md:text-sm font-mono ${
                        isDarkMode ? 'bg-gray-800 text-purple-400' : 'bg-gray-100 text-purple-600'
                      }`}
                      {...props}
                    />
                  ) : (
                    <code
                      className={`block p-3 rounded-lg text-xs md:text-sm font-mono overflow-x-auto ${
                        isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}
                      {...props}
                    />
                  ),
                pre: ({ node, ...props }) => (
                  <pre
                    className={`rounded-lg p-4 mb-3 overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
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
              className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 ${
                isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}
            >
              <Sparkles
                className={`w-6 h-6 md:w-8 md:h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
              />
            </div>
            <h3
              className={`text-base md:text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              No Review Yet
            </h3>
            <p
              className={`text-xs md:text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Write some code and click "Generate Review" to get AI-powered feedback
            </p>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <p className="mb-2">💡 AI will analyze:</p>
              <ul className="list-disc list-inside space-y-1 text-left inline-block">
                <li>Code quality & best practices</li>
                <li>Potential bugs & improvements</li>
                <li>Security considerations</li>
                <li>Performance optimization tips</li>
                <li>Code structure & organization</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPanel;
