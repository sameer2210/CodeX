import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import Project from '../models/project.model.js';
import Team from '../models/team.model.js';

describe('Project Endpoints', () => {
    let token;
    const mockTeam = {
        teamName: 'projectteam',
        username: 'projectuser',
        password: 'password123',
    };

    beforeAll(async () => {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codex-test';
        await mongoose.connect(mongoURI);
    });

    afterAll(async () => {
        await Team.deleteMany({});
        await Project.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Team.deleteMany({});
        await Project.deleteMany({});

        // Register and login to get token
        await request(app).post('/api/auth/register').send(mockTeam);
        const res = await request(app).post('/api/auth/login').send(mockTeam);
        token = res.body.token;
    });

    describe('POST /api/projects/create', () => {
        it('should create a new project successfully', async () => {
            const res = await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Test Project'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.project.name).toBe('Test Project');
            expect(res.body.project.teamName).toBe(mockTeam.teamName);
        });

        it('should fail if name is missing', async () => {
            const res = await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/projects/get-all', () => {
        it('should return all projects for the team', async () => {
            // Create a project first
            await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Project 1' });

            const res = await request(app)
                .get('/api/projects/get-all')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.projects.length).toBeGreaterThan(0);
            expect(res.body.projects[0].name).toBe('Project 1');
        });
    });
});
