import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token requerido'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const companyId = socket.user?.company?._id ?? socket.user?.company;
    if (companyId) {
      socket.join(companyId.toString());
    }
  });

  return io;
};

export const getIO = () => {
  if (!io) return { to: () => ({ emit: () => {} }) };
  return io;
};
