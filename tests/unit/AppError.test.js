import { describe, it, expect } from '@jest/globals';
import { AppError } from '../../src/utils/AppError.js';

describe('AppError', () => {
  it('crea un error con los valores por defecto', () => {
    const err = new AppError('algo falló');
    expect(err.message).toBe('algo falló');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('APP_ERROR');
    expect(err.isOperational).toBe(true);
  });

  it('badRequest devuelve 400', () => {
    const err = AppError.badRequest('campo inválido', 'BAD_FIELD');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_FIELD');
  });

  it('unauthorized devuelve 401', () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('forbidden devuelve 403', () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
  });

  it('notFound devuelve 404', () => {
    const err = AppError.notFound('no existe', 'NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('no existe');
  });

  it('conflict devuelve 409', () => {
    const err = AppError.conflict();
    expect(err.statusCode).toBe(409);
  });

  it('es instancia de Error', () => {
    const err = new AppError('test');
    expect(err).toBeInstanceOf(Error);
  });
});
