import { describe, it, expect, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { AppError } from '../../src/utils/AppError.js';

const mockRes = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { res: { status, json }, status, json };
};

describe('errorHandler middleware', () => {
  it('maneja AppError con su statusCode', () => {
    const { res, status, json } = mockRes();
    const err = AppError.notFound('No encontrado', 'NOT_FOUND');
    errorHandler(err, {}, res, jest.fn());
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'NOT_FOUND' }));
  });

  it('maneja error de duplicado (11000)', () => {
    const { res, status, json } = mockRes();
    const err = { code: 11000, keyValue: { email: 'x@x.com' } };
    errorHandler(err, {}, res, jest.fn());
    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'DUPLICATE_KEY' }));
  });

  it('maneja CastError de Mongoose', () => {
    const { res, status, json } = mockRes();
    const err = new mongoose.Error.CastError('ObjectId', 'bad-id', '_id');
    errorHandler(err, {}, res, jest.fn());
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'CAST_ERROR' }));
  });

  it('maneja error de límite de archivo (Multer)', () => {
    const { res, status, json } = mockRes();
    const err = { code: 'LIMIT_FILE_SIZE' };
    errorHandler(err, {}, res, jest.fn());
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'FILE_TOO_LARGE' }));
  });

  it('maneja error genérico con 500', () => {
    const { res, status, json } = mockRes();
    const err = new Error('Error inesperado');
    errorHandler(err, {}, res, jest.fn());
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INTERNAL_ERROR' }));
  });
});
