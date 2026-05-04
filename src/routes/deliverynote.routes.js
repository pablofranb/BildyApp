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

router.post('/', validate(createDeliveryNoteSchema), createDeliveryNote);
router.get('/', getDeliveryNotes);
// /pdf/:id debe ir antes de /:id para que Express no interprete 'pdf' como un id
router.get('/pdf/:id', getDeliveryNotePdf);
router.get('/:id', getDeliveryNote);
router.delete('/:id', deleteDeliveryNote);
router.patch('/:id/sign', upload.single('signature'), signDeliveryNote);

export default router;
