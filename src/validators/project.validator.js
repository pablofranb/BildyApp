import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  postal: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional()
}).optional();

const projectBase = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  projectCode: z.string().trim().min(1, 'El código de proyecto es obligatorio').toUpperCase(),
  address: addressSchema,
  email: z.string().trim().email('Email no válido').optional(),
  notes: z.string().trim().optional(),
  client: z.string().regex(/^[a-f\d]{24}$/i, 'El cliente no es válido'),
  active: z.boolean().optional()
});

export const createProjectSchema = projectBase;

export const updateProjectSchema = projectBase.partial();
