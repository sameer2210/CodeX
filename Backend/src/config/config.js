import { config } from 'dotenv';
config();

const _config = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/codex',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
};

export default Object.freeze(_config);
