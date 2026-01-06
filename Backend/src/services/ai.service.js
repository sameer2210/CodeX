import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config.js';

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);

class AIService {
  async reviewCode(code, language = 'javascript') {
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid input: code must be a non-empty string.');
    }

    try {
      console.log(`🤖 Reviewing ${language} code...`);

      const model = genAI.getGenerativeModel({
        model: 'gemini-pro',
      });

      const prompt = `You are an expert Full-Stack Developer specializing in code reviews.

Review this ${language} code and provide constructive feedback.

**Guidelines:**
1. Keep feedback concise & actionable
2. Use markdown formatting with headers (##, ###)
3. Highlight 2-4 key issues maximum
4. Provide specific code improvements
5. End with encouragement

**Code to Review:**
\`\`\`${language}
${code}
\`\`\`

**Format your response like this:**
##  What's Good
- [positive points]

##  Needs Improvement
- [specific issues]

##  Suggested Improvements
\`\`\`${language}
// Your improved version
\`\`\`

##  Final Thoughts
[encouraging message]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(' Review generated successfully');
      return text;
    } catch (err) {
      console.error(' AI review failed:', err.message);

      // Return fallback review
      return this.getFallbackReview(code, language);
    }
  }

  getFallbackReview(code, language) {
    const lines = code.split('\n').length;

    return `## 📊 Code Analysis (Fallback Mode)

**Note:** AI service temporarily unavailable. Here's a basic analysis:

### ✅ What's Good
- Code is ${lines} lines long
- Language: ${language}

### ⚠️ General Suggestions
- Ensure proper error handling
- Add comments for complex logic
- Follow ${language} best practices
- Write unit tests

### 💡 Next Steps
- Review for edge cases
- Optimize performance if needed
- Check security considerations

### 🎯 Keep Coding!
Great work on writing code! Keep practicing and improving.`;
  }
}

export default new AIService();
