import { describe, it, expect, jest } from '@jest/globals';
import { z } from 'zod';
import { validate } from '../../src/middleware/validate.js';

const schema = z.object({
  name: z.string().min(1),
  age: z.number()
});

describe('validate middleware', () => {
  it('llama a next si el body es válido', () => {
    const req = { body: { name: 'Pablo', age: 25 } };
    const res = {};
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('devuelve 400 si el body es inválido', () => {
    const req = { body: { name: '' } };
    const json = jest.fn();
    const res = { status: jest.fn().mockReturnValue({ json }) };
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'VALIDATION_ERROR' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('sustituye req.body con los datos parseados por Zod', () => {
    const trimSchema = z.object({ name: z.string().trim(), age: z.number() });
    const req = { body: { name: '  Pablo  ', age: 25 } };
    const res = {};
    const next = jest.fn();

    validate(trimSchema)(req, res, next);

    expect(req.body.name).toBe('Pablo');
  });
});
