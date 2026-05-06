import { z } from 'zod';

const clientBase = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  cif: z.string().trim().min(1, 'El CIF es obligatorio').toUpperCase(),
  address: z.object({
    street: z.string().trim().optional(),
    number: z.string().trim().optional(),
    postal: z.string().trim().optional(),
    city: z.string().trim().optional(),
    province: z.string().trim().optional()
  }).optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email('Email no válido').optional()
});

export const createClientSchema = clientBase;

export const updateClientSchema = clientBase.partial();
