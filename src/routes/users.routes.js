import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  registerCtrl,
  loginCtrl,
  getMe
} from '../controllers/users.controller.js';
import authMiddleware from "../middleware/auth.middleware.js";
const router = Router();
router.get("/", authMiddleware, getMe);
router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUser);
router.post("/", authMiddleware, createUser);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.post('/register', registerCtrl);
router.post('/login', loginCtrl);
//prueba

export default router;
// Qué deberías entender al acabar el bloque 3
// Qué pasa en register
// llega un usuario nuevo
// se valida si ya existe
// se protege la contraseña
// se guarda en la base de datos
// se devuelve token
// Qué pasa en login
// llega un usuario que ya existe
// se comprueba email
// se compara contraseña
// si todo va bien, se devuelve token
// Qué hace JWT
// crear una credencial temporal para el usuario
// Qué hace bcrypt
// evitar guardar contraseñas reales en texto plano