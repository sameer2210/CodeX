import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Download, RefreshCw, Sparkles, Terminal } from 'lucide-react';
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
import { LEDIndicator, HUDLabel } from '../../../../components/HUD';

const ReviewPanel = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();

  const review = useAppSelector(selectCurrentProjectReview);
  const code = useAppSelector(selectCurrentProjectCode);
  const language = useAppSelector(selectCurrentProjectLanguage);
  const socketConnected = useAppSelector(state => state.socket.connected);

  const [isGenerating, setIsGenerating] = useState(false);
  const accentText = isDarkMode ? 'text-[#17E1FF]' : 'text-[#0F6E88]';
  const mutedText = isDarkMode ? 'text-white/50' : 'text-[#0B0E11]/60';
  const secondaryText = isDarkMode ? 'text-white/70' : 'text-[#0B0E11]/70';
  const headerBorder = isDarkMode ? 'border-white/10' : 'border-[#0B0E11]/10';
  const iconShell = isDarkMode
    ? 'bg-white/5 border-white/10'
    : 'bg-[#0B0E11]/5 border-[#0B0E11]/10';
  const proseClass = `prose max-w-none ${isDarkMode ? 'prose-invert' : 'prose-slate'}`;
  const emptyTitleText = isDarkMode ? 'text-white' : 'text-[#0B0E11]';

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
- **Has Loops:** ${hasLoops ? 'Yes' : ' No'}
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
      className={`relative flex flex-col h-full rounded-2xl overflow-hidden border transition-colors duration-500
      ${isDarkMode ? 'bg-[#0B0E11] border-white/10' : 'bg-[#F4F6F5] border-[#10120F]/10'}`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#17E1FF]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className={`relative p-3 border-b flex items-center justify-between ${headerBorder}`}>
        <div className="flex items-center gap-4">
          <div
            className={`relative flex items-center justify-center w-9 h-9 rounded-xl border ${iconShell}`}
          >
            <Terminal className={`w-5 h-5 ${accentText}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <LEDIndicator />
              <span className={`text-[11px] font-mono tracking-[0.3em] uppercase ${mutedText}`}>
                AI ANALYSIS CODE REVIEW
              </span>
            </div>

          </div>
          {!socketConnected && (
            <HUDLabel
              label="MODE"
              value="OFFLINE"
              color={isDarkMode ? '#F59E0B' : '#B45309'}
              labelClassName={mutedText}
              valueClassName={secondaryText}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {review && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyReview}
                className={`p-2.5 transition-colors ${secondaryText} ${
                  isDarkMode ? 'hover:text-[#17E1FF]' : 'hover:text-[#0F6E88]'
                }`}
                title="Copy"
              >
                <Copy size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadReview}
                className={`p-2.5 transition-colors ${secondaryText} ${
                  isDarkMode ? 'hover:text-[#17E1FF]' : 'hover:text-[#0F6E88]'
                }`}
                title="Download"
              >
                <Download size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearReview}
                className={`p-2.5 transition-colors ${secondaryText} ${
                  isDarkMode ? 'hover:text-[#17E1FF]' : 'hover:text-[#0F6E88]'
                }`}
                title="Clear"
              >
                <RefreshCw size={18} />
              </motion.button>
            </>
          )}

          <motion.button
            onClick={getReview}
            disabled={!code.trim() || isGenerating}
            whileHover={!isGenerating ? { scale: 1.05 } : {}}
            whileTap={!isGenerating ? { scale: 0.95 } : {}}
            className={`group relative h-11 px-8 rounded-full border overflow-hidden font-mono uppercase tracking-wider text-sm font-medium disabled:opacity-40 ${
              isDarkMode
                ? 'border-white/20 hover:border-[#17E1FF] text-white'
                : 'border-[#0B0E11]/20 hover:border-[#0F6E88] text-[#0B0E11]'
            }`}
          >
            <motion.div
              className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ${
                isDarkMode ? 'bg-[#c6c6c6]' : 'bg-[#0B0E11]'
              }`}
            />
            <span
              className={`relative z-10 transition-colors ${
                isDarkMode ? 'group-hover:text-black' : 'group-hover:text-white'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 border-2 rounded-full animate-spin ${
                      isDarkMode ? 'border-white/30 border-t-white' : 'border-black/30 border-t-black'
                    }`}
                  />
                  ANALYZING
                </span>
              ) : (
                'GENERATE REVIEW'
              )}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Review Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {review ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={proseClass}
            >
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className={`text-3xl font-black tracking-tighter mb-4 ${
                        isDarkMode ? 'text-white' : 'text-[#0B0E11]'
                      }`}
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className={`text-2xl font-bold mt-8 mb-3 ${accentText}`} {...props} />
                  ),
                  code: ({ inline, ...props }) =>
                    inline ? (
                      <code
                        className={`px-2 py-0.5 rounded font-mono ${
                          isDarkMode
                            ? 'bg-white/10 text-[#17E1FF]'
                            : 'bg-[#0B0E11]/5 text-[#0B0E11]'
                        }`}
                        {...props}
                      />
                    ) : (
                      <code className="block font-mono text-sm overflow-x-auto" {...props} />
                    ),
                }}
              >
                {review}
              </ReactMarkdown>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >

              <Sparkles className={`w-10 h-10 ${accentText}`} />

              <h3 className={`text-2xl font-bold tracking-tight mb-2 ${emptyTitleText}`}>
                Ready for Analysis
              </h3>
              <p className={`max-w-xs ${mutedText}`}>
                Write code and press "Generate Review" to get advanced AI feedback powered by Gemini
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewPanel;
