import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNote,
  deleteDeliveryNote
} from '../controllers/deliverynote.controller.js';
import { createDeliveryNoteSchema } from '../validators/deliverynote.validator.js';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createDeliveryNoteSchema), createDeliveryNote);
router.get('/', getDeliveryNotes);
// la ruta /pdf/:id debe ir antes de /:id para que Express no interprete 'pdf' como un id
router.get('/pdf/:id', (req, res) => res.status(501).json({ error: 'PDF pendiente de implementar' }));
router.get('/:id', getDeliveryNote);
router.delete('/:id', deleteDeliveryNote);
// firma — pendiente de implementar junto con el servicio de almacenamiento
router.patch('/:id/sign', (req, res) => res.status(501).json({ error: 'Firma pendiente de implementar' }));

export default router;
