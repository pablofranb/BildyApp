import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { sendSlackNotification } from '../utils/handleLogger.js';

const notifySlack = (err, req) => {
  const message = [
    `🚨 *Error 5XX en BildyApp API*`,
    `*Timestamp:* ${new Date().toISOString()}`,
    `*Método:* ${req.method}`,
    `*Ruta:* ${req.originalUrl}`,
    `*Mensaje:* ${err.message}`,
    `*Stack:*\n\`\`\`${err.stack}\`\`\``
  ].join('\n');

  sendSlackNotification(message);
};

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Error creado con AppError
  if (err instanceof AppError || err.isOperational) {
    if (err.statusCode >= 500) notifySlack(err, req);
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details })
    });
  }

  // Error de validación de Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      error: true,
      message: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details
    });
  }

  // Error de Cast (id inválido)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: true,
      message: `Valor inválido para '${err.path}'`,
      code: 'CAST_ERROR'
    });
  }

  // Error de duplicado
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];

    return res.status(409).json({
      error: true,
      message: `Ya existe un registro con ese '${field}'`,
      code: 'DUPLICATE_KEY'
    });
  }

  // Error de Zod
  if (err.name === 'ZodError') {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));

    return res.status(400).json({
      error: true,
      message: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details
    });
  }

  // Error de Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: true,
      message: 'Archivo muy grande',
      code: 'FILE_TOO_LARGE'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: true,
      message: 'Demasiados archivos',
      code: 'TOO_MANY_FILES'
    });
  }

  // Error no controlado
  notifySlack(err, req);
  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    error: true,
    message: isProduction ? 'Error interno del servidor' : err.message,
    code: 'INTERNAL_ERROR',
    ...(!isProduction && { stack: err.stack })
  });
};