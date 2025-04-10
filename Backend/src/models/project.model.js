import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "project name is required"]
  }
});
