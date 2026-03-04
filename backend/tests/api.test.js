const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/db');

let adminToken = '';
let userToken = '';
let testMatchId = '';
let team1Id = '';
let team2Id = '';

beforeAll(async () => {
    
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    await pool.query("DELETE FROM matches WHERE location = 'Estadio Central'");
    await pool.query("DELETE FROM users WHERE email LIKE '%@testliga.com'");
    await pool.query("DELETE FROM teams WHERE name IN ('TestTeam A', 'TestTeam B')");
    await pool.query("SET FOREIGN_KEY_CHECKS = 1"); 

    
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
    try {
        await pool.query("SET FOREIGN_KEY_CHECKS = 0");
        await pool.query("DELETE FROM matches WHERE location = 'Estadio Central'");
        await pool.query("DELETE FROM teams WHERE name IN ('TestTeam A', 'TestTeam B')");
        await pool.query("DELETE FROM users WHERE email LIKE '%@testliga.com'");
        await pool.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch (error) {
        console.error("Error en limpieza:", error.message);
    } finally {
        await pool.end();
    }
});

describe('Pruebas de la API LigaManager', () => {

    it('1. Debe registrar un nuevo usuario correctamente', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Nuevo Jugador', email: 'nuevo@testliga.com', password: '123' });
        expect(res.statusCode).toEqual(201);
    });

    it('2. Admin debe poder crear un partido', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ local_team_id: team1Id, visitor_team_id: team2Id, match_date: '2026-05-01 20:00:00', location: 'Estadio Central' });
        
        expect(res.statusCode).toEqual(201);
        testMatchId = res.body.matchId; 
    });

    it('3. Usuario normal NO debe poder crear un partido (Autorización)', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ local_team_id: team1Id, visitor_team_id: team2Id, match_date: '2026-05-01 20:00:00', location: 'Estadio Central' });
        
        expect(res.statusCode).toEqual(403); 
    });

    it('4. Debe listar partidos con ESTRUCTURA DE PAGINACIÓN', async () => {
        const res = await request(app)
            .get('/api/matches?page=1&limit=5')
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('5. Debe obtener UN SOLO partido por su ID (GET /api/matches/:id)', async () => {
        const res = await request(app)
            .get(`/api/matches/${testMatchId}`)
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toEqual(testMatchId);
    });

    it('6. Admin debe poder actualizar el marcador (PATCH)', async () => {
        const res = await request(app)
            .patch(`/api/matches/${testMatchId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Finalizado', local_score: 3, visitor_score: 0 });
            
        expect(res.statusCode).toEqual(200);
    });

    it('7. Debe fallar al intentar obtener un partido que no existe', async () => {
        const res = await request(app)
            .get('/api/matches/999999')
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toEqual(404);
    });

    it('8. Admin debe poder eliminar un partido', async () => {
        const res = await request(app)
            .delete(`/api/matches/${testMatchId}`)
            .set('Authorization', `Bearer ${adminToken}`);
            
        expect(res.statusCode).toEqual(200);
    });
});