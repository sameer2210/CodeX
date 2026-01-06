import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    teamName: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ['user', 'system', 'notification'],
      default: 'user',
    },
    metadata: {
      edited: { type: Boolean, default: false },
      editedAt: Date,
      replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
messageSchema.index({ teamName: 1, projectId: 1, createdAt: -1 });

// Virtual for message age
messageSchema.virtual('age').get(function () {
  return Date.now() - this.createdAt.getTime();
});

export default mongoose.model('Message', messageSchema);
