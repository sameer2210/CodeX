import { GoogleGenAI } from "@google/genai";
import {_config} from "../config/config.js";
import { config } from "dotenv";

const ai = new GoogleGenAI({ apiKey: config.GOOGLE_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "create a function of add two numbers in javascript",
    config: {
        systemInstruction: "Use a clear, professional, and approachable tone. Ensure the language is concise and well-structured, suitable for explaining technical concepts to individuals with varying levels of experience. Avoid jargon where possible, and when technical terms are necessary, provide brief explanations or context. The writing should maintain clarity and precision while remaining engaging and easy to follow."
    }
  });
  console.log(response.text);
}

await main();