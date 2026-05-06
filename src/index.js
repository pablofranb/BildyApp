import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import dbConnect from './config/db.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT;

const startServer = async () => {
  await dbConnect();

  const httpServer = createServer(app);
  const io = initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });

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
