
//es donde construyes y configuras la aplicación Express. Aquí es donde defines tus rutas, middlewares mi confi etc
//aqui monto mi back
import express from 'express';
import userRoutes from './routes/users.routes.js';

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

app.use('/api/user', userRoutes);

export default app;

