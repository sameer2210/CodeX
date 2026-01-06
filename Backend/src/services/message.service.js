import Message from '../models/message.model.js';

class MessageService {
  async getProjectMessages(teamName, projectId, options = {}) {
    const { limit = 100, before, after } = options;

    const query = { teamName, projectId };

    if (before) query.createdAt = { $lt: new Date(before) };
    if (after) query.createdAt = { $gt: new Date(after) };

    return await Message.find(query).sort({ createdAt: -1 }).limit(limit).select('-__v').lean();
  }

  async createMessage(data) {
    const message = new Message({
      projectId: data.projectId,
      teamName: data.teamName,
      username: data.username,
      message: data.message,
      type: data.type || 'user',
    });

    await message.save();
    return message.toObject();
  }

  async createSystemMessage(teamName, projectId, text) {
    return await this.createMessage({
      teamName,
      projectId,
      username: 'System',
      message: text,
      type: 'system',
    });
  }

  async deleteProjectMessages(projectId) {
    return await Message.deleteMany({ projectId });
  }

  async getUnreadCount(teamName, projectId, since) {
    return await Message.countDocuments({
      teamName,
      projectId,
      createdAt: { $gt: new Date(since) },
    });
  }
}

export default new MessageService();
