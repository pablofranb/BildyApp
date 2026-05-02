import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createClient,
  getClients,
  getArchivedClients,
  getClient,
  updateClient,
  deleteClient,
  restoreClient
} from '../controllers/client.controller.js';
import {
  createClientSchema,
  updateClientSchema
} from '../validators/client.validator.js';

const router = Router();

// aplicamos authMiddleware a todas las rutas de este router de una sola vez
router.use(authMiddleware);

router.post('/', validate(createClientSchema), createClient);       // crear cliente
router.get('/', getClients);                                        // listar activos
router.get('/archived', getArchivedClients);                        // listar archivados
router.get('/:id', getClient);                                      // obtener uno
router.put('/:id', validate(updateClientSchema), updateClient);     // actualizar
router.delete('/:id', deleteClient);                                // borrar (soft o hard)
router.patch('/:id/restore', restoreClient);                        // restaurar

export default router;
