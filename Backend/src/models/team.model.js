import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  members: [memberSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
teamSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to add member
teamSchema.methods.addMember = function (username, isAdmin = false) {
  const existingMember = this.members.find(member => member.username === username);

  if (!existingMember) {
    this.members.push({
      username,
      isAdmin,
      joinedAt: new Date(),
      lastLogin: new Date(),
    });
  } else {
    existingMember.lastLogin = new Date();
    existingMember.isActive = true;
  }

  return this.save();
};

// Instance method to get active members
teamSchema.methods.getActiveMembers = function () {
  return this.members.filter(member => member.isActive);
};

const Team = mongoose.model('Team', teamSchema);

export default Team;
