import { config } from 'dotenv';
config();

const parseOrigins = value =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => item.replace(/\/+$/, ''));

const envOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL;

const _config = {
  FRONTEND_URLS: envOrigins ? parseOrigins(envOrigins) : ['http://localhost:5173'],

  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/codex',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
};

export default Object.freeze(_config);
