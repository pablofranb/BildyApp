import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // autenticamos cada conexión con el JWT antes de permitir el handshake
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
    // cada usuario entra en la room de su empresa: así los eventos solo llegan a su compañía
    const companyId = socket.user?.company?._id ?? socket.user?.company;
    if (companyId) {
      socket.join(companyId.toString());
    }
  });

  return io;
};

// singleton para que los controladores puedan emitir sin recibir io por parámetro
// en tests no hay servidor HTTP, así que devolvemos un objeto inerte si no está listo
export const getIO = () => {
  if (!io) return { to: () => ({ emit: () => {} }) };
  return io;
};
