import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createProject,
  getProjects,
  getArchivedProjects,
  getProject,
  updateProject,
  deleteProject,
  restoreProject
} from '../controllers/project.controller.js';
import {
  createProjectSchema,
  updateProjectSchema
} from '../validators/project.validator.js';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/archived', getArchivedProjects);
router.get('/:id', getProject);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);
router.patch('/:id/restore', restoreProject);

export default router;
