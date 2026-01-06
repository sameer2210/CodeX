import express from 'express';
import { getProjectMessages, getUnreadCount } from '../controllers/message.controllers.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/project/:projectId', getProjectMessages);
router.get('/project/:projectId/unread', getUnreadCount);

export default router;
