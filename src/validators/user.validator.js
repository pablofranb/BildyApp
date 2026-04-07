import { z } from "zod";
//vZod es una librería para validar datos,on Zod defines schema y Zod comprueba si los datos cumplen esa regla.
export const loginSchema = z.object({
  email: z.string().email().transform(e => e.toLowerCase()),
  password: z.string().min(1),
});

// esquema zod para register
export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email no válido")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});
//validar
export const validationCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')
});

//parte de cambia contraseña, necesito la contraseña actual y la nueva, y que sean diferentes entre sí
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "NEW_PASSWORD_MUST_BE_DIFFERENT",
  path: ["newPassword"]
});