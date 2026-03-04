const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/db');

let adminToken = '';
let userToken = '';
let testMatchId = '';
let team1Id = '';
let team2Id = '';

beforeAll(async () => {
    
    await pool.query("DELETE FROM users WHERE email LIKE '%@testliga.com'");
    await pool.query("DELETE FROM teams WHERE name LIKE 'TestTeam%'");

    
    await request(app).post('/api/auth/register').send({ 
        name: 'Admin Test', email: 'admin@testliga.com', password: '123', adminSecret: 'GOAT' 
    });
    await request(app).post('/api/auth/register').send({ 
        name: 'User Test', email: 'user@testliga.com', password: '123' 
    });

    const resAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@testliga.com', password: '123' });
    adminToken = resAdmin.body.token;

    const resUser = await request(app).post('/api/auth/login').send({ email: 'user@testliga.com', password: '123' });
    userToken = resUser.body.token;

    
    const [resTeam1] = await pool.query("INSERT INTO teams (name) VALUES ('TestTeam A')");
    const [resTeam2] = await pool.query("INSERT INTO teams (name) VALUES ('TestTeam B')");
    team1Id = resTeam1.insertId;
    team2Id = resTeam2.insertId;
});

afterAll(async () => {
    
    if (testMatchId) {
        await pool.query("DELETE FROM matches WHERE id = ?", [testMatchId]);
    }
    await pool.query("DELETE FROM teams WHERE name LIKE 'TestTeam%'");
    await pool.query("DELETE FROM users WHERE email LIKE '%@testliga.com'");
    await pool.end();
});

describe('Pruebas Básicas de la API', () => {

    it('Debe registrar un usuario y hacer login', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'user@testliga.com', password: '123' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('Debe listar los equipos', async () => {
        const res = await request(app).get('/api/teams').set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
    });

    it('Admin debe poder crear un partido', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${adminToken}`)
            
            .send({ local_team_id: team1Id, visitor_team_id: team2Id, match_date: '2026-05-01 20:00:00', location: 'Estadio Central' });
        
        expect(res.statusCode).toEqual(201);
        testMatchId = res.body.matchId; 
    });

    it('Usuario normal NO debe poder crear un partido', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ local_team_id: team1Id, visitor_team_id: team2Id, match_date: '2026-05-01 20:00:00', location: 'Estadio Central' });
        
        expect(res.statusCode).toEqual(403); 
    });

    it('Admin debe poder actualizar el marcador', async () => {
        const res = await request(app)
            .patch(`/api/matches/${testMatchId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Finalizado', local_score: 2, visitor_score: 1 });
            
        expect(res.statusCode).toEqual(200);
    });
});