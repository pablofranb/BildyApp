import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import userRoutes from './routes/users.routes.js';
import clientRoutes from './routes/client.routes.js';
import projectRoutes from './routes/project.routes.js';
import deliveryNoteRoutes from './routes/deliverynote.routes.js';
import morganBody from 'morgan-body';
import { loggerStream } from './utils/handleLogger.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(helmet());
if (process.env.NODE_ENV !== 'test') {
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
}
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'BildyApp API funcionando' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400,
  stream: loggerStream
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/user', userRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/deliverynote', deliveryNoteRoutes);
app.use(errorHandler);

export default app;
