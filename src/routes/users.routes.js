import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  registerCtrl,
  loginCtrl
} from '../controllers/users.controller.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/register', registerCtrl);
router.post('/login', loginCtrl);

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