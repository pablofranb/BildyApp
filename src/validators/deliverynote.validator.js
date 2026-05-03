import { z } from 'zod';

const materialSchema = z.object({
  format: z.literal('material'),
  items: z
    .array(
      z.object({
        material: z.string().trim().min(1, 'El material es obligatorio'),
        quantity: z
          .number({ invalid_type_error: 'La cantidad debe ser un número' })
          .positive('La cantidad debe ser positiva'),
        unit: z.string().trim().min(1, 'La unidad es obligatoria')
      })
    )
    .min(1, 'Debe haber al menos un ítem'),
  workDate: z.coerce.date({ invalid_type_error: 'Fecha no válida' }),
  client: z.string().min(1, 'El cliente es obligatorio'),
  project: z.string().min(1, 'El proyecto es obligatorio')
});

// para format: 'hours' se requiere hours o workers (o ambos)
const hoursSchema = z
  .object({
    format: z.literal('hours'),
    hours: z
      .number({ invalid_type_error: 'Las horas deben ser un número' })
      .positive('Las horas deben ser positivas')
      .optional(),
    workers: z
      .number({ invalid_type_error: 'Los trabajadores deben ser un número' })
      .int()
      .positive('Debe ser al menos 1 trabajador')
      .optional(),
    workDate: z.coerce.date({ invalid_type_error: 'Fecha no válida' }),
    client: z.string().min(1, 'El cliente es obligatorio'),
    project: z.string().min(1, 'El proyecto es obligatorio')
  })
  .refine((data) => data.hours !== undefined || data.workers !== undefined, {
    message: 'Debe indicar horas o número de trabajadores',
    path: ['hours']
  });

// discriminatedUnion elige el esquema correcto según el valor de 'format'
export const createDeliveryNoteSchema = z.discriminatedUnion('format', [
  materialSchema,
  hoursSchema
]);
