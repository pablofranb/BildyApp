import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, disconnectDB, clearDB } from '../db.js';
import { createTestUser } from '../helpers.js';

let token;
let clientId;
let projectId;

const setup = async () => {
  const data = await createTestUser();
  token = data.token;

  const client = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Cliente Albarán', cif: 'A00000001' });
  clientId = client.body.data._id;

  const project = await request(app)
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Proyecto Albarán', projectCode: 'ALB-001', client: clientId });
  projectId = project.body.data._id;
};

beforeAll(async () => {
  await connectDB();
  await setup();
});

afterEach(async () => {
  await clearDB();
  await setup();
});

afterAll(async () => {
  await disconnectDB();
});

const materialPayload = () => ({
  format: 'material',
  items: [{ material: 'Cemento', quantity: 10, unit: 'sacos' }],
  workDate: '2026-05-04',
  client: clientId,
  project: projectId
});

const hoursPayload = () => ({
  format: 'hours',
  hours: 8,
  workers: 2,
  workDate: '2026-05-04',
  client: clientId,
  project: projectId
});

describe('POST /api/deliverynote', () => {
  it('crea albarán de materiales', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send(materialPayload());

    expect(res.status).toBe(201);
    expect(res.body.data.format).toBe('material');
  });

  it('crea albarán de horas', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send(hoursPayload());

    expect(res.status).toBe(201);
    expect(res.body.data.format).toBe('hours');
  });

  it('devuelve 400 si el formato es inválido', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({ format: 'invalid', workDate: '2026-05-04', client: clientId, project: projectId });

    expect(res.status).toBe(400);
  });

  it('devuelve 404 si el cliente no pertenece a la empresa', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...materialPayload(), client: '000000000000000000000000' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/deliverynote', () => {
  it('lista albaranes con paginación', async () => {
    await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send(materialPayload());

    const res = await request(app)
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('filtra por formato', async () => {
    await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send(hoursPayload());

    const res = await request(app)
      .get('/api/deliverynote?format=hours')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.data.every((n) => n.format === 'hours')).toBe(true);
  });
});

describe('GET /api/deliverynote/:id', () => {
  it('obtiene un albarán con populate', async () => {
    const created = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send(materialPayload());

    const id = created.body.data._id;
    const res = await request(app)
      .get(`/api/deliverynote/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  it('devuelve 404 si no existe', async () => {
    const res = await request(app)
      .get('/api/deliverynote/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/deliverynote/pdf/:id', () => {
  it('genera el PDF correctamente', async () => {
    const created = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send(materialPayload());

    const id = created.body.data._id;
    const res = await request(app)
      .get(`/api/deliverynote/pdf/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
  });

  it('devuelve 404 si el albarán no existe', async () => {
    const res = await request(app)
      .get('/api/deliverynote/pdf/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/deliverynote/:id', () => {
  it('elimina un albarán no firmado', async () => {
    const created = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send(materialPayload());

    const id = created.body.data._id;
    const res = await request(app)
      .delete(`/api/deliverynote/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('DELIVERYNOTE_DELETED');
  });

  it('devuelve 404 si no existe', async () => {
    const res = await request(app)
      .delete('/api/deliverynote/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
