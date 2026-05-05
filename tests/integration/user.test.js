import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, disconnectDB, clearDB } from '../db.js';
import { createTestUser } from '../helpers.js';

let token;
let userId;

beforeAll(async () => {
  await connectDB();
  const data = await createTestUser();
  token = data.token;
  userId = data.user._id.toString();
});

afterEach(async () => {
  await clearDB();
  const data = await createTestUser();
  token = data.token;
  userId = data.user._id.toString();
});

afterAll(async () => {
  await disconnectDB();
});

describe('POST /api/user/register', () => {
  it('registra un usuario nuevo', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ name: 'Nuevo', email: 'nuevo@test.com', password: 'Pass1234!' });

    expect([200, 201]).toContain(res.status);
    expect(res.body.accessToken || res.body.data).toBeDefined();
  });

  it('devuelve 400 si falta el email', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ name: 'Sin email', password: 'Pass1234!' });

    expect(res.status).toBe(400);
  });

  it('devuelve error si el email ya existe', async () => {
    await request(app)
      .post('/api/user/register')
      .send({ name: 'Duplicado', email: 'dup@test.com', password: 'Pass1234!' });

    const res = await request(app)
      .post('/api/user/register')
      .send({ name: 'Duplicado2', email: 'dup@test.com', password: 'Pass1234!' });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('POST /api/user/login', () => {
  it('hace login con credenciales correctas', async () => {
    await request(app)
      .post('/api/user/register')
      .send({ name: 'Login', email: 'login@test.com', password: 'Pass1234!' });

    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'login@test.com', password: 'Pass1234!' });

    expect([200, 201]).toContain(res.status);
  });

  it('devuelve 401 con contraseña incorrecta', async () => {
    await request(app)
      .post('/api/user/register')
      .send({ name: 'Login2', email: 'login2@test.com', password: 'Pass1234!' });

    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'login2@test.com', password: 'Incorrecta999!' });

    expect(res.status).toBe(401);
  });

  it('devuelve 400 si falta la contraseña', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'alguien@test.com' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/user/me', () => {
  it('devuelve el perfil del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('devuelve 401 sin token', async () => {
    const res = await request(app).get('/api/user/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/user', () => {
  it('lista usuarios autenticado', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

describe('GET /api/user/:id', () => {
  it('obtiene un usuario por id', async () => {
    const res = await request(app)
      .get(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('devuelve 404 si no existe', async () => {
    const res = await request(app)
      .get('/api/user/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/user/me', () => {
  it('actualiza el perfil del usuario', async () => {
    const res = await request(app)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Actualizado' });

    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/user/company', () => {
  it('actualiza la empresa del usuario', async () => {
    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nueva Empresa', cif: 'Z11111111' });

    expect([200, 201]).toContain(res.status);
  });
});

describe('PUT /api/user/password', () => {
  it('devuelve error si la contraseña actual es incorrecta', async () => {
    const res = await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'Incorrecta!', newPassword: 'NuevoPass1!' });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('POST /api/user/logout', () => {
  it('cierra la sesión del usuario', async () => {
    const res = await request(app)
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 204]).toContain(res.status);
  });
});
