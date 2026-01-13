import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config.js';

const ai = new GoogleGenerativeAI(config.GOOGLE_API_KEY);

class AIService {
  async reviewCode(code, language = 'javascript') {
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid input: code must be a non-empty string.');
    }

    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    try {
      console.log(` Reviewing ${language} code...`);

      const prompt = this.buildPrompt(code, language);

      //  CORRECT API FOR THIS SDK
      const response = await model.generateContent(prompt);

      return {
        success: true,
        review: response.response.text(),
      };
    } catch (err) {
      const msg = err?.message || '';

      // Quota exceeded
      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota')) {
        return {
          success: false,
          reason: 'AI_QUOTA_EXCEEDED',
          review: this.getQuotaExceededReview(language),
        };
      }

      //  Model overloaded / network / other
      console.error('AI review failed:', msg);

      return {
        success: false,
        reason: 'AI_FAILED',
        review: this.getFallbackReview(language),
      };
    }
  }

  buildPrompt(code, language) {
    return `
You are a senior ${language} developer and code reviewer.

Your task is to analyze the code step by step and produce a structured review.

IMPORTANT RULES:
- Be clear and concise
- Do NOT repeat the entire code
- Use markdown headings
- Max 3–5 key issues
- Suggestions must be practical

---
## 1️⃣ Current Code Behavior
Explain clearly:
- What this code does
- How it executes
- What happens when it runs

## 2️⃣ Current Output / Result
Describe:
- What output or result this code produces
- Any side effects (logs, mutations, API calls, state changes)

## 3️⃣ Issues & Risks
Identify:
- Bugs or logical issues
- Edge cases
- Performance concerns
- Security problems (if any)

## 4️⃣ Suggestions & Improvements
Give actionable improvements with short explanations.

## 5️⃣ Improved Code Snippet
Provide ONLY the improved or corrected part of the code.
Keep it minimal.

## 6️⃣ Important Notes
Mention:
- Best practices
- Mordern way
- Scalability concerns
- Maintainability tips
- Testing suggestions

---
CODE TO REVIEW:
\`\`\`${language}
${code}
\`\`\`

End with a short encouraging sentence.
`;
  }

  getFallbackReview(language) {
    return `## ⚠️ AI Review Unavailable

The AI service is temporarily unavailable.

### Suggestions
- Add error handling
- Improve naming consistency
- Follow ${language} best practices
- Write unit tests

### Keep going
Your structure is on the right track.`;
  }

  getQuotaExceededReview(language) {
    return `## 🚫 AI Quota Reached

Your Gemini API quota has been exhausted.

### What you can do
- Enable billing in Google Cloud
- Wait for quota reset
- Switch to a paid plan

### Status
- Language: ${language}
- AI Engine: Gemini

💡 This does **not** affect collaboration or saving.`;
  }
}

export default new AIService();
