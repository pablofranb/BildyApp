import { Router } from 'express';
import { upload } from '../middleware/upload.js';
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
  changePasswordCtrl,
  deleteMeCtrl,
  uploadLogoCtrl,
  updateMeCtrl
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

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y autenticación
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Usuarios]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Usuario registrado. Se envía email de verificación.
 *       400:
 *         description: Datos inválidos
 */
router.post('/register', validate(registerSchema), registerCtrl);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Usuarios]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login correcto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', validate(loginSchema), loginCtrl);

/**
 * @swagger
 * /user/refresh:
 *   post:
 *     summary: Renovar token de acceso
 *     tags: [Usuarios]
 *     security: []
 *     responses:
 *       200:
 *         description: Token renovado
 */
router.post('/refresh', refreshTokenCtrl);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autenticado
 */
router.get("/me", authMiddleware, getMe);

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.put('/me', authMiddleware, updateMeCtrl);

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Eliminar cuenta propia
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuenta eliminada
 */
router.delete('/', authMiddleware, deleteMeCtrl);

/**
 * @swagger
 * /user/validation:
 *   put:
 *     summary: Validar email con código recibido
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: Email validado
 *       400:
 *         description: Código incorrecto
 */
router.put('/validation', authMiddleware, validate(validationCodeSchema), validateEmailCtrl);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post('/logout', authMiddleware, logoutCtrl);

/**
 * @swagger
 * /user/password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.put('/password', authMiddleware, validate(changePasswordSchema), changePasswordCtrl);

/**
 * @swagger
 * /user/logo:
 *   patch:
 *     summary: Subir logo del usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo subido
 */
router.patch('/logo', authMiddleware, upload.single('logo'), uploadLogoCtrl);

/**
 * @swagger
 * /user/company:
 *   patch:
 *     summary: Asociar o actualizar empresa del usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *     responses:
 *       200:
 *         description: Empresa actualizada
 */
router.patch('/company', authMiddleware, updateCompanyCtrl);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Listar todos los usuarios (admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Sin permisos
 */
router.get("/", authMiddleware, getUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Obtener usuario por ID (admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: No encontrado
 */
router.get("/:id", authMiddleware, getUser);

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Crear usuario (admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Usuario creado
 *       403:
 *         description: Sin permisos
 */
router.post('/', authMiddleware, checkRol(['admin']), createUser);

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Actualizar usuario por ID (admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/:id', authMiddleware, checkRol(['admin']), updateUser);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Eliminar usuario por ID (admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       403:
 *         description: Sin permisos
 */
router.delete('/:id', authMiddleware, checkRol(['admin']), deleteUser);

export default router;
