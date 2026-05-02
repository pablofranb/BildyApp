import { z } from 'zod';

// esquema base con todos los campos del cliente
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

// al crear: name y cif son obligatorios
export const createClientSchema = clientBase;

// al actualizar: todos los campos son opcionales
export const updateClientSchema = clientBase.partial();
