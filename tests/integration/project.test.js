import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, disconnectDB, clearDB } from '../db.js';
import { createTestUser } from '../helpers.js';

let token;
let clientId;

const createClient = (t) =>
  request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${t}`)
    .send({ name: 'Cliente Proyecto', cif: 'P00000001' });

beforeAll(async () => {
  await connectDB();
  const data = await createTestUser();
  token = data.token;
  const c = await createClient(token);
  clientId = c.body.data._id;
});

afterEach(async () => {
  await clearDB();
  const data = await createTestUser();
  token = data.token;
  const c = await createClient(token);
  clientId = c.body.data._id;
});

afterAll(async () => {
  await disconnectDB();
});

const projectPayload = () => ({
  name: 'Proyecto Test',
  projectCode: 'PRJ-001',
  client: clientId
});

describe('POST /api/project', () => {
  it('crea un proyecto correctamente', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send(projectPayload());

    expect(res.status).toBe(201);
    expect(res.body.data.projectCode).toBe('PRJ-001');
  });

  it('devuelve 400 si falta el código', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sin código', client: clientId });

    expect(res.status).toBe(400);
  });

  it('devuelve 404 si el cliente no existe', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'P', projectCode: 'X-001', client: '000000000000000000000000' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/project', () => {
  it('lista proyectos con paginación', async () => {
    await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send(projectPayload());

    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('filtra por nombre', async () => {
    await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Único', projectCode: 'UNI-001', client: clientId });

    const res = await request(app)
      .get('/api/project?name=Único')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('GET /api/project/:id', () => {
  it('obtiene un proyecto por id', async () => {
    const created = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send(projectPayload());

    const id = created.body.data._id;
    const res = await request(app)
      .get(`/api/project/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  it('devuelve 404 si no existe', async () => {
    const res = await request(app)
      .get('/api/project/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/project/:id', () => {
  it('actualiza el nombre del proyecto', async () => {
    const created = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send(projectPayload());

    const id = created.body.data._id;
    const res = await request(app)
      .put(`/api/project/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nombre nuevo' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Nombre nuevo');
  });
});

describe('DELETE /api/project/:id', () => {
  it('hard delete elimina el proyecto', async () => {
    const created = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send(projectPayload());

    const id = created.body.data._id;
    const res = await request(app)
      .delete(`/api/project/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('PROJECT_DELETED');
  });

  it('soft delete archiva el proyecto', async () => {
    const created = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send(projectPayload());

    const id = created.body.data._id;
    const res = await request(app)
      .delete(`/api/project/${id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('PROJECT_ARCHIVED');
  });
});

describe('GET /api/project/archived', () => {
  it('lista proyectos archivados', async () => {
    const created = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send(projectPayload());

    const id = created.body.data._id;
    await request(app)
      .delete(`/api/project/${id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/project/archived')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((p) => p._id === id)).toBe(true);
  });
});

describe('PATCH /api/project/:id/restore', () => {
  it('restaura un proyecto archivado', async () => {
    const created = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send(projectPayload());

    const id = created.body.data._id;
    await request(app)
      .delete(`/api/project/${id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/project/${id}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(false);
  });
});
