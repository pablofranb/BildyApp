//verifica el token y añade el usuario a req.user.

import User from '../models/user.model.js';
import { verifyToken } from '../utils/handleJwt.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Verificar que existe el header Authorization
    if (!req.headers.authorization) {
     
      return res.status(401).json({ error: "TOKEN_REQUIRED" });
    }
    
    // Extraer token: "Bearer eyJhbG..." -> "eyJhbG..."
    const token = req.headers.authorization.split(' ').pop();
    
    // Verificar token
    const dataToken = verifyToken(token);
    
    if (!dataToken || !dataToken._id) {
      
      return res.status(401).json({ error: "TOKEN_REQUIRED" });
    }
    
    // Buscar usuario y añadirlo a req
    const user = await User.findById(dataToken._id);
    
    if (!user) {
      return res.status(401).json({ error: "TOKEN_REQUIRED" });
    }
    
    // Inyectar usuario en la petición
    req.user = user;
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "TOKEN_REQUIRED" });
  }
};

export default authMiddleware;