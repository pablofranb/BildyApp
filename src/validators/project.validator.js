import { z } from 'zod';

const projectBase = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  projectCode: z.string().trim().min(1, 'El código de proyecto es obligatorio').toUpperCase(),
  description: z.string().trim().optional(),
  // client debe ser un ObjectId válido de MongoDB
  client: z.string().regex(/^[a-f\d]{24}$/i, 'El cliente no es válido'),
  active: z.boolean().optional()
});

// al crear: name, projectCode y client son obligatorios
export const createProjectSchema = projectBase;

// al actualizar: todos los campos son opcionales
export const updateProjectSchema = projectBase.partial();
