import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  registerCtrl,
  loginCtrl,
  getMe,
  updateCompanyCtrl,
  validateEmailCtrl,
  refreshTokenCtrl,
  logoutCtrl,
  changePasswordCtrl
} from '../controllers/users.controller.js';

import authMiddleware from "../middleware/auth.middleware.js";
import checkRol from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  validationCodeSchema,
  changePasswordSchema
} from "../validators/user.validator.js";

const router = Router();

// privadas
router.get("/me", authMiddleware, getMe);
router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUser);
router.patch('/company', authMiddleware, updateCompanyCtrl);
router.put('/validation', authMiddleware, validate(validationCodeSchema), validateEmailCtrl);
router.post('/refresh', refreshTokenCtrl);
router.post('/logout', authMiddleware, logoutCtrl);
router.put('/password', authMiddleware, validate(changePasswordSchema), changePasswordCtrl);

// privadas restringidas por rol
router.post('/', authMiddleware, checkRol(['admin']), createUser);
router.put('/:id', authMiddleware, checkRol(['admin']), updateUser);
router.delete('/:id', authMiddleware, checkRol(['admin']), deleteUser);

// públicas
router.post('/register', validate(registerSchema), registerCtrl);
router.post('/login', validate(loginSchema), loginCtrl);

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