import authService from '../services/auth.service.js';

class AuthController {
  // Register new team
  async register(req, res) {
    try {
      const { teamName, username, password } = req.body;

      // Validation
      if (!teamName || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Team name, username, and password are required',
        });
      }

      // Additional validation
      if (teamName.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Team name must be at least 3 characters long',
        });
      }

      if (username.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 2 characters long',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
      }

      const result = await authService.registerTeam(teamName, username, password);

      res.status(201).json({
        success: true,
        message: result.message,
        teamName: result.teamName,
      });
    } catch (error) {
      console.error('Registration error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { teamName, username, password } = req.body;

      // Validation
      if (!teamName || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Team name, username, and password are required',
        });
      }

      const result = await authService.loginUser(teamName, username, password);

      res.json({
        success: true,
        message: 'Login successful',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get team members
  async getTeamMembers(req, res) {
    try {
      const { teamName } = req.params;

      if (!teamName) {
        return res.status(400).json({
          success: false,
          message: 'Team name is required',
        });
      }

      const result = await authService.getTeamMembers(teamName);

      res.json({
        success: true,
        teamName: result.teamName,
        members: result.members,
        totalMembers: result.totalMembers,
      });
    } catch (error) {
      console.error('Get team members error:', error.message);
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update member activity
  async updateMemberActivity(req, res) {
    try {
      const { teamName, username } = req.params;
      const { isActive } = req.body;

      // Verify user has access to this team
      if (req.user.teamName !== teamName || req.user.username !== username) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const result = await authService.updateMemberActivity(teamName, username, isActive);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Update member activity error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Verify token (middleware endpoint)
  async verifyToken(req, res) {
    try {
      // Token is already verified by middleware, just return user info
      res.json({
        success: true,
        user: {
          teamName: req.user.teamName,
          username: req.user.username,
          isAdmin: req.user.isAdmin,
        },
      });
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401).json({
        success: false,
        message: 'Token verification failed',
      });
    }
  }

  // Logout (client-side token removal, but useful for activity tracking)
  async logout(req, res) {
    try {
      const { teamName, username } = req.user;

      // Update member activity to inactive
      await authService.updateMemberActivity(teamName, username, false);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error.message);
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    }
  }
}

export default new AuthController();
