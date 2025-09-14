import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Team from '../models/team.model.js';

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.saltRounds = 10;
  }

  // Hash password
  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  // Compare password
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Register new team
  async registerTeam(teamName, username, password) {
    try {
      // Check if team already exists
      const existingTeam = await Team.findOne({ teamName: teamName.toLowerCase() });
      if (existingTeam) {
        throw new Error('Team name already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create new team
      const newTeam = new Team({
        teamName: teamName.toLowerCase(),
        password: hashedPassword,
        members: [
          {
            username,
            isAdmin: true,
            joinedAt: new Date(),
            lastLogin: new Date(),
          },
        ],
      });

      await newTeam.save();

      return {
        success: true,
        teamName: newTeam.teamName,
        message: 'Team created successfully',
      };
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user
  async loginUser(teamName, username, password) {
    try {
      // Find team
      const team = await Team.findOne({ teamName: teamName.toLowerCase() });
      if (!team) {
        throw new Error('Invalid team credentials');
      }

      // Check password
      const isPasswordValid = await this.comparePassword(password, team.password);
      if (!isPasswordValid) {
        throw new Error('Invalid team credentials');
      }

      // Find or add member
      let member = team.members.find(m => m.username === username);
      if (!member) {
        // Add new team member
        await team.addMember(username, false);
        member = team.members.find(m => m.username === username);
      } else {
        // Update last login
        member.lastLogin = new Date();
        member.isActive = true;
        await team.save();
      }

      // Generate token
      const token = this.generateToken({
        teamName: team.teamName,
        username: member.username,
        isAdmin: member.isAdmin,
        memberId: member._id,
      });

      return {
        success: true,
        token,
        user: {
          teamName: team.teamName,
          username: member.username,
          isAdmin: member.isAdmin,
          lastLogin: member.lastLogin,
        },
      };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Get team members
  async getTeamMembers(teamName) {
    try {
      const team = await Team.findOne({ teamName: teamName.toLowerCase() });
      if (!team) {
        throw new Error('Team not found');
      }

      const activeMembers = team.getActiveMembers().map(member => ({
        username: member.username,
        isAdmin: member.isAdmin,
        lastLogin: member.lastLogin,
        joinedAt: member.joinedAt,
        isActive: member.isActive,
      }));

      return {
        success: true,
        teamName: team.teamName,
        members: activeMembers,
        totalMembers: activeMembers.length,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get team members');
    }
  }

  // Update member activity status
  async updateMemberActivity(teamName, username, isActive = true) {
    try {
      const team = await Team.findOne({ teamName: teamName.toLowerCase() });
      if (!team) {
        throw new Error('Team not found');
      }

      const member = team.members.find(m => m.username === username);
      if (!member) {
        throw new Error('Member not found');
      }

      member.isActive = isActive;
      member.lastLogin = new Date();
      await team.save();

      return {
        success: true,
        message: `Member activity updated`,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update member activity');
    }
  }

  // Validate team access
  async validateTeamAccess(teamName, username) {
    try {
      const team = await Team.findOne({ teamName: teamName.toLowerCase() });
      if (!team) {
        return false;
      }

      const member = team.members.find(m => m.username === username && m.isActive);
      return !!member;
    } catch (error) {
      return false;
    }
  }

  async getTeamMessages(teamName) {
    try {
      const messages = await Message.find({ teamName: teamName.toLowerCase() })
        .sort({ timestamp: 1 })
        .limit(100); // Last 100 for performance
      return {
        success: true,
        teamName,
        messages,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get messages');
    }
  }
}

export default new AuthService();
