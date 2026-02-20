import express from 'express';
import config from '../config/config.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const normalizeUrls = value =>
  (value || '')
    .split(',')
    .map(url => url.trim())
    .filter(Boolean);

router.get('/turn', verifyToken, (req, res) => {
  const stunUrls = normalizeUrls(config.STUN_URLS);
  const turnUrls = normalizeUrls(config.TURN_URLS);

  const iceServers = [
    {
      urls:
        stunUrls.length > 0
          ? stunUrls
          : ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
  ];

  if (turnUrls.length > 0) {
    const turnServer = { urls: turnUrls };
    if (config.TURN_USERNAME) turnServer.username = config.TURN_USERNAME;
    if (config.TURN_CREDENTIAL) turnServer.credential = config.TURN_CREDENTIAL;
    iceServers.push(turnServer);
  }

  res.json({
    success: true,
    iceServers,
    hasTurn: turnUrls.length > 0,
  });
});

export default router;
