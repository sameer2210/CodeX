import authService from '../services/auth.service.js';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Validate team access (optional additional security)
    const hasAccess = await authService.validateTeamAccess(decoded.teamName, decoded.username);

    if (!hasAccess) {
      return res.status(401).json({
        success: false,
        message: 'Access denied - invalid team membership',
      });
    }

    // Add user info to request
    req.user = {
      teamName: decoded.teamName,
      username: decoded.username,
      isAdmin: decoded.isAdmin,
      memberId: decoded.memberId,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

// Middleware to check team ownership
export const checkTeamAccess = (req, res, next) => {
  const { teamName } = req.params;

  if (!req.user || req.user.teamName.toLowerCase() !== teamName.toLowerCase()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied - not a member of this team',
    });
  }
  next();
};

// Rate limiting middleware (basic implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // Max requests per window

export const rateLimiter = (req, res, next) => {
  const clientIP =
    req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, []);
  }
  const requests = requestCounts.get(clientIP);

  // Remove old requests
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  requestCounts.set(clientIP, recentRequests);

  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000),
    });
  }

  // Add current request
  recentRequests.push(now);
  next();
};

// Clean up old rate limit data periodically
setInterval(
  () => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    for (const [clientIP, requests] of requestCounts.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      if (recentRequests.length === 0) {
        requestCounts.delete(clientIP);
      } else {
        requestCounts.set(clientIP, recentRequests);
      }
    }
  },
  5 * 60 * 1000
); // Clean up every 5 minutes
