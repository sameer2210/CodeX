import mongoose from "mongoose";
import config from "../config/config.js";

function connectToDb() {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("connected to MongoDB");
    })
    .catch((error) => {
      console.log("Error MongoDB not connected to DataBase ", error.message);
    });
}

export default connectToDb;