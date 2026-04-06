//es donde construyes y configuras la aplicación Express. Aquí es donde defines tus rutas, middlewares mi confi etc
//aqui monto mi back
import express from "express";
//las de users
import userRoutes from './routes/users.routes.js';

//creo mi applicacion de express
const app = express();
//para que entienda json en los campos 
app.use(express.json());

//creo  una ruta de prueba para ver q funciona
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use('/api/users', userRoutes);
export default app;