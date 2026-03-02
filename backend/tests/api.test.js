const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/db');

let adminToken = '';
let userToken = '';

beforeAll(async () => {
    // Registra y loguea un admin de prueba
    await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admintest@liga.com', password: 'password123', role: 'admin' });
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admintest@liga.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    // Registra y loguea un usuario de prueba
    await request(app).post('/api/auth/register').send({ name: 'User', email: 'usertest@liga.com', password: 'password123', role: 'user' });
    const userLogin = await request(app).post('/api/auth/login').send({ email: 'usertest@liga.com', password: 'password123' });
    userToken = userLogin.body.token;
});

afterAll(async () => {
    await pool.end();
});

describe('Pruebas Automatizadas de la API', () => {

    it('Login exitoso', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'usertest@liga.com', password: 'password123' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('Login fallido', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'usertest@liga.com', password: 'wrongpassword' });
        expect(res.statusCode).toEqual(401);
    });

    it('Listar registros', async () => {
        const res = await request(app)
            .get('/api/matches')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
    });

    it('Acceso denegado por rol', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ local_team_id: 1, visitor_team_id: 2, match_date: '2026-03-01 15:00:00', location: 'Cancha 1' });
        expect(res.statusCode).toEqual(403);
    });

    it('Validacion fallida', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ local_team_id: 1 });
        expect(res.statusCode).toEqual(500);
    });

    it('Acceso permitido por rol', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ local_team_id: 1, visitor_team_id: 1, match_date: '2026-03-01 15:00:00', location: 'Cancha 1' });
        expect(res.statusCode).toEqual(201);
    });

    it('Crear registro', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ local_team_id: 1, visitor_team_id: 1, match_date: '2026-03-02 10:00:00', location: 'Cancha 2' });
        expect(res.statusCode).toEqual(201);
    });

    it('Paginacion o filtros', async () => {
        const res = await request(app)
            .get('/api/matches?location=Cancha 1')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
    });

});