import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "project name is required"]
    },
    code: {
      type: String,
      default: ""
    },
    review: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const projectModel = mongoose.model("project", projectSchema);
export default projectModel;
