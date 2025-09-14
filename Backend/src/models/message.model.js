// import mongoose from 'mongoose';

// const messageSchema = new mongoose.Schema(
//   {
//     project: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Project',
//       required: [true, 'porject is required'],
//     },
//     text: {
//       type: String,
//       required: [true, 'Message text is required'],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const messageModel = mongoose.model('Message', messageSchema);
// export default messageModel;


import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    lowercase: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
  },
  username: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;