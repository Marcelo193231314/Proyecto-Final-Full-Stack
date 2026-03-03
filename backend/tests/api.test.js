const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/config/db');

let adminToken = '';
let userToken = '';
let createdMatchId = '';
let teamIdToUpdate = 1;

beforeAll(async () => {
    
    await request(app).post('/api/auth/register').send({ 
        name: 'Admin Master', 
        email: 'adminmaster@liga.com', 
        password: 'password123', 
        adminSecret: 'GOAT' 
    });
    const adminLogin = await request(app).post('/api/auth/login').send({ 
        email: 'adminmaster@liga.com', 
        password: 'password123' 
    });
    adminToken = adminLogin.body.token;

    
    await request(app).post('/api/auth/register').send({ 
        name: 'User Master', 
        email: 'usermaster@liga.com', 
        password: 'password123' 
    });
    const userLogin = await request(app).post('/api/auth/login').send({ 
        email: 'usermaster@liga.com', 
        password: 'password123' 
    });
    userToken = userLogin.body.token;
});

afterAll(async () => {
    await pool.end();
});

describe('1. Pruebas de Autenticación y Registro (Auth)', () => {

    it('Debe denegar el registro de un admin con código secreto incorrecto', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Fake Admin', email: 'fakeadmin@liga.com', password: '123', adminSecret: 'WRONG' });
        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('error', 'Código secreto incorrecto. Registro denegado.');
    });

    it('Debe registrar un nuevo usuario correctamente', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Nuevo Jugador', email: 'jugador@liga.com', password: '123' });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Registro exitoso');
        expect(res.body.role).toEqual('user');
    });

    it('Login exitoso y retorno de token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'usermaster@liga.com', password: 'password123' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('role', 'user');
    });

    it('Login fallido por contraseña incorrecta', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'usermaster@liga.com', password: 'wrongpassword' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Contraseña incorrecta');
    });

    it('Login fallido por usuario no encontrado', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'noexiste@liga.com', password: '123' });
        expect(res.statusCode).toEqual(404);
    });
});

describe('2. Pruebas de Gestión de Partidos (Matches)', () => {

    it('Debe denegar la creación de un partido si el rol es usuario', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ local_team_id: 1, visitor_team_id: 2, match_date: '2026-03-01 15:00:00', location: 'Cancha 1' });
        expect(res.statusCode).toEqual(403); 
    });

    it('Debe crear un partido correctamente con rol admin', async () => {
        const res = await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ local_team_id: 1, visitor_team_id: 2, match_date: '2026-04-10 16:00:00', location: 'Estadio Principal' });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('matchId');
        
        createdMatchId = res.body.matchId;
    });

    it('Debe listar todos los partidos correctamente', async () => {
        const res = await request(app)
            .get('/api/matches')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('Debe actualizar el marcador y estado de un partido', async () => {
        const res = await request(app)
            .patch(`/api/matches/${createdMatchId}/status`) 
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Finalizado', local_score: 3, visitor_score: 1 });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Resultado y estado actualizados correctamente');
    });

    it('Debe eliminar un partido correctamente', async () => {
        const res = await request(app)
            .delete(`/api/matches/${createdMatchId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Partido eliminado correctamente');
    });

    it('Debe devolver error al intentar eliminar un partido inexistente', async () => {
        const res = await request(app)
            .delete('/api/matches/999999')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Partido no encontrado');
    });
});

describe('3. Pruebas de Gestión de Equipos (Teams)', () => {

    it('Debe listar todos los equipos', async () => {
        const res = await request(app)
            .get('/api/teams')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('Debe actualizar el nombre de un equipo', async () => {
        const res = await request(app)
            .put(`/api/teams/${teamIdToUpdate}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Nuevo Nombre de Equipo FC' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Nombre del equipo actualizado correctamente');
    });
});