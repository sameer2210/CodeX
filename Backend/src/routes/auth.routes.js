import express from 'express';
import authController from '../controllers/auth.controllers.js';
import { checkTeamAccess, rateLimiter, verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(rateLimiter);

router.post('/register', authController.register);
router.post('/login', authController.login);

router.use(verifyToken);

router.get('/verify', authController.verifyToken);
router.post('/logout', authController.logout);

router.get('/team/:teamName/members', checkTeamAccess, authController.getTeamMembers);
router.put(
  '/team/:teamName/member/:username/activity',
  checkTeamAccess,
  authController.updateMemberActivity
);

router.get('/team/:teamName/messages', checkTeamAccess, authController.getTeamMessages);

export default router;
