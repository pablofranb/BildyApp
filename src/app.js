
//es donde construyes y configuras la aplicación Express. Aquí es donde defines tus rutas, middlewares mi confi etc
//aqui monto mi back
import express from 'express';
import userRoutes from './routes/users.routes.js';
import clientRoutes from './routes/client.routes.js';
import projectRoutes from './routes/project.routes.js';
import deliveryNoteRoutes from './routes/deliverynote.routes.js';
import path from 'path';
import morganBody from 'morgan-body';
import { loggerStream } from './utils/handleLogger.js';
import { errorHandler } from './middleware/error-handler.js';
const app = express();

//para que entienda json en los campos 
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'BildyApp API funcionando'
  });
});
//creo  una ruta de prueba para ver q funciona
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Después de express.json(), antes de las rutas
morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400, // Solo errores
  stream: loggerStream
});

app.use('/api/user', userRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/deliverynote', deliveryNoteRoutes);
app.use('/uploads', express.static(path.resolve('uploads')));

app.use(errorHandler);

export default app;

