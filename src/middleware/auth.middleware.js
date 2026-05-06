import User from '../models/user.model.js';
import { verifyToken } from '../utils/handleJwt.js';

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "TOKEN_REQUIRED" });
    }

    const token = req.headers.authorization.split(' ').pop();
    const dataToken = verifyToken(token);

    if (!dataToken || !dataToken._id) {
      return res.status(401).json({ error: "TOKEN_REQUIRED" });
    }

    const user = await User.findById(dataToken._id);

    if (!user) {
      return res.status(401).json({ error: "TOKEN_REQUIRED" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "TOKEN_REQUIRED" });
  }
};

export default authMiddleware;
