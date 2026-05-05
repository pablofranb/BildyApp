import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, disconnectDB, clearDB } from '../db.js';
import { createTestUser } from '../helpers.js';

let token;
let companyId;

beforeAll(async () => {
  await connectDB();
  const data = await createTestUser();
  token = data.token;
  companyId = data.company._id;
});

afterEach(async () => {
  await clearDB();
  const data = await createTestUser();
  token = data.token;
  companyId = data.company._id;
});

afterAll(async () => {
  await disconnectDB();
});

describe('POST /api/client', () => {
  it('crea un cliente correctamente', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente A', cif: 'A12345678' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Cliente A');
    expect(res.body.data.cif).toBe('A12345678');
  });

  it('devuelve 400 si falta el nombre', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ cif: 'A12345678' });

    expect(res.status).toBe(400);
  });

  it('devuelve 401 sin token', async () => {
    const res = await request(app)
      .post('/api/client')
      .send({ name: 'X', cif: 'X12345678' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/client', () => {
  it('lista clientes activos con paginación', async () => {
    await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente B', cif: 'B12345678' });

    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('filtra por nombre', async () => {
    await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Filtrable', cif: 'F12345678' });

    const res = await request(app)
      .get('/api/client?name=Filtrable')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toBe('Filtrable');
  });
});

describe('GET /api/client/:id', () => {
  it('obtiene un cliente por id', async () => {
    const created = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente C', cif: 'C12345678' });

    const id = created.body.data._id;

    const res = await request(app)
      .get(`/api/client/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  it('devuelve 404 si no existe', async () => {
    const res = await request(app)
      .get('/api/client/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/client/:id', () => {
  it('actualiza un cliente', async () => {
    const created = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Original', cif: 'O12345678' });

    const id = created.body.data._id;

    const res = await request(app)
      .put(`/api/client/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Actualizado');
  });
});

describe('DELETE /api/client/:id', () => {
  it('hard delete elimina el cliente', async () => {
    const created = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'A borrar', cif: 'D12345678' });

    const id = created.body.data._id;

    const res = await request(app)
      .delete(`/api/client/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('CLIENT_DELETED');
  });

  it('soft delete archiva el cliente', async () => {
    const created = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'A archivar', cif: 'E12345678' });

    const id = created.body.data._id;

    const res = await request(app)
      .delete(`/api/client/${id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('CLIENT_ARCHIVED');
  });
});

describe('GET /api/client/archived', () => {
  it('lista clientes archivados', async () => {
    const created = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Archivado', cif: 'G12345678' });

    const id = created.body.data._id;

    await request(app)
      .delete(`/api/client/${id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/client/archived')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((c) => c._id === id)).toBe(true);
  });
});

describe('PATCH /api/client/:id/restore', () => {
  it('restaura un cliente archivado', async () => {
    const created = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'A restaurar', cif: 'H12345678' });

    const id = created.body.data._id;

    await request(app)
      .delete(`/api/client/${id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/client/${id}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(false);
  });
});
