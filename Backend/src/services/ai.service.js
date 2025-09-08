import { GoogleGenAI } from '@google/genai';
import config from '../config/config.js';

const ai = new GoogleGenAI({ apiKey: config.GOOGLE_API_KEY });

export async function getCodeReview(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid input: code must be a non-empty string.');
  }

  try {
    console.log(' Reviewing code:\n', code);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-thinking-exp-01-21',
      contents: code,
      config: {
        systemInstruction: `
                              Role:
                              You are an expert Full-Stack Developer (MERN + DevOps). Review the given code and return clear, short, and actionable feedback.
                              ⸻
                              Review Strategy:
                              1. Keep it short & focused
                                 - Use bullets, not long paragraphs
                                 - Prioritize top 2–4 issues only
                              2. Lead with positivity
                                 - Start with quick praises
                              3. Point out mistakes
                                 - Be specific with 1-liner reasons
                              4. Suggest improvements
                                 - Show a corrected version of the code
                                 - Add best practices (error handling, modularity, naming)
                              5. Close warmly
                                 - End with quick motivation
                              ⸻
                              Output Format

                              ###  What’s Good
                              - [positive points]

                              ###  Needs Improvement
                              - [issues]

                              ---
                              ###  Suggested Improved Version
                              \`\`\`js
                              // corrected code here
                              \`\`\`
                              ⸻
                               Final Thought
                              [encouraging closure]
                           `,
      },
    });

    return response.text;
  } catch (err) {
    console.error(' AI review failed:', err.message);
    throw new Error('AI review service unavailable. Please try again.');
  }
}
