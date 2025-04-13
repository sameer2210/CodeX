import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "porject is required"]
    },
    text: {
      type: String,
      required: [true, "Message text is required"]
    }
  },
  {
    timestamps: true
  }
);

const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;
