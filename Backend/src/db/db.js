import mongoose from 'mongoose';
import config from '../config/config.js';

const connectToDb = async () => {
  try {
    const mongoURI = config.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected Successfully => ${config.MONGODB_URI}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export default connectToDb;
