import { z } from 'zod';

const workerSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del trabajador es obligatorio'),
  hours: z.number({ invalid_type_error: 'Las horas deben ser un número' }).positive('Las horas deben ser positivas')
});

const commonFields = {
  description: z.string().trim().optional(),
  workDate: z.coerce.date({ invalid_type_error: 'Fecha no válida' }),
  client: z.string().min(1, 'El cliente es obligatorio'),
  project: z.string().min(1, 'El proyecto es obligatorio')
};

const materialSchema = z.object({
  format: z.literal('material'),
  material: z.string().trim().min(1, 'El material es obligatorio'),
  quantity: z.number({ invalid_type_error: 'La cantidad debe ser un número' }).positive('La cantidad debe ser positiva'),
  unit: z.string().trim().min(1, 'La unidad es obligatoria'),
  ...commonFields
});

const hoursSchema = z
  .object({
    format: z.literal('hours'),
    hours: z.number({ invalid_type_error: 'Las horas deben ser un número' }).positive('Las horas deben ser positivas').optional(),
    workers: z.array(workerSchema).optional(),
    ...commonFields
  })
  .refine((data) => data.hours !== undefined || (data.workers && data.workers.length > 0), {
    message: 'Debe indicar horas o al menos un trabajador',
    path: ['hours']
  });

export const createDeliveryNoteSchema = z.discriminatedUnion('format', [
  materialSchema,
  hoursSchema
]);
