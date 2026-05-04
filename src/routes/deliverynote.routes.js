import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote,
  getDeliveryNotePdf,
  signDeliveryNote
} from '../controllers/deliverynote.controller.js';
import { createDeliveryNoteSchema } from '../validators/deliverynote.validator.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Albaranes
 *   description: Gestión de albaranes, PDFs y firmas
 */

/**
 * @swagger
 * /deliverynote:
 *   post:
 *     summary: Crear albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/DeliveryNoteInputMaterial'
 *               - $ref: '#/components/schemas/DeliveryNoteInputHours'
 *     responses:
 *       201:
 *         description: Albarán creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryNote'
 *       400:
 *         description: Datos inválidos o cliente/proyecto no pertenecen a la empresa
 */
router.post('/', validate(createDeliveryNoteSchema), createDeliveryNote);

/**
 * @swagger
 * /deliverynote:
 *   get:
 *     summary: Listar albaranes con paginación y filtros
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filtrar por ID de proyecto
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: Filtrar por ID de cliente
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [material, hours]
 *       - in: query
 *         name: signed
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de trabajo desde
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de trabajo hasta
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de albaranes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeliveryNote'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', getDeliveryNotes);

/**
 * @swagger
 * /deliverynote/pdf/{id}:
 *   get:
 *     summary: Generar y descargar el PDF de un albarán
 *     tags: [Albaranes]
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
 *         description: PDF del albarán
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Albarán no encontrado
 */
router.get('/pdf/:id', getDeliveryNotePdf);

/**
 * @swagger
 * /deliverynote/{id}:
 *   get:
 *     summary: Obtener albarán por ID (con datos relacionados)
 *     tags: [Albaranes]
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
 *         description: Datos del albarán con cliente, proyecto y usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryNote'
 *       404:
 *         description: Albarán no encontrado
 */
router.get('/:id', getDeliveryNote);

/**
 * @swagger
 * /deliverynote/{id}:
 *   delete:
 *     summary: Eliminar albarán (solo si no está firmado)
 *     tags: [Albaranes]
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
 *         description: Albarán eliminado
 *       400:
 *         description: No se puede eliminar un albarán firmado
 *       404:
 *         description: Albarán no encontrado
 */
router.delete('/:id', deleteDeliveryNote);

/**
 * @swagger
 * /deliverynote/{id}/sign:
 *   patch:
 *     summary: Firmar albarán subiendo imagen de firma
 *     tags: [Albaranes]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [signature]
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de la firma (JPG, PNG o WEBP, máx 5MB)
 *     responses:
 *       200:
 *         description: Albarán firmado y PDF regenerado con la firma
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryNote'
 *       400:
 *         description: Ya firmado o falta imagen
 *       404:
 *         description: Albarán no encontrado
 */
router.patch('/:id/sign', upload.single('signature'), signDeliveryNote);

export default router;
