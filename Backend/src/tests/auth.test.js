import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import Team from '../models/team.model.js';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Connect to the test database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codex-test';
    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    // Clean up and close connection
    await Team.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear teams before each test
    await Team.deleteMany({});
  });

  const mockTeam = {
    teamName: 'testteam',
    username: 'testuser',
    password: 'password123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new team successfully', async () => {
      const res = await request(app).post('/api/auth/register').send(mockTeam);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.teamName).toBe(mockTeam.teamName);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        teamName: 'testteam',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should prevent duplicate team registration', async () => {
      await request(app).post('/api/auth/register').send(mockTeam);
      const res = await request(app).post('/api/auth/register').send(mockTeam);

      expect(res.statusCode).toEqual(400); // Or whatever status your controller returns for duplicates
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(mockTeam);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send(mockTeam);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        ...mockTeam,
        password: 'wrongpassword',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });
});
