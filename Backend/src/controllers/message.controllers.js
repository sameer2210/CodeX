import messageService from '../services/message.service.js';

export const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit, before, after } = req.query;
    const { teamName } = req.user;

    const messages = await messageService.getProjectMessages(teamName, projectId, {
      limit: limit ? parseInt(limit) : 100,
      before,
      after,
    });

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      count: messages.length,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { since } = req.query;
    const { teamName } = req.user;

    const count = await messageService.getUnreadCount(teamName, projectId, since);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message,
    });
  }
};
