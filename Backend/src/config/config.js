import { config } from "dotenv";
config();

const _config = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  MONGODB_URI: process.env.MONGODB_URI,
};

export default Object.freeze(_config);
