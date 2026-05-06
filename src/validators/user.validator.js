import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().transform(e => e.toLowerCase()),
  password: z.string().min(1),
});

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

export const validationCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "NEW_PASSWORD_MUST_BE_DIFFERENT",
  path: ["newPassword"]
});
