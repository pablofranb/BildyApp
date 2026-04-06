import { z } from "zod";

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