//arranco el back  llamando a mi app y a la conexion a la base de datos, lo hago en un async await para asegurarme que se conecta antes de arrancar el servidor
import { createServer } from 'http';
import mongoose from 'mongoose';
import app from "./app.js";
import dbConnect from "./config/db.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT; //cojo el peurto del env

const startServer = async () => {
  await dbConnect();

  // Socket.IO necesita el servidor HTTP directamente, no la app Express
  const httpServer = createServer(app);
  const io = initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });

  // cerramos conexiones ordenadamente para no perder datos al parar el contenedor
  const shutdown = async (signal) => {
    console.log(`${signal} recibido, cerrando servidor...`);
    io.close();
    httpServer.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();