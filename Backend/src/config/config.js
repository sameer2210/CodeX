import { config } from "dotenv";
config();

const _config = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
};

export default Object.freeze(_config);
