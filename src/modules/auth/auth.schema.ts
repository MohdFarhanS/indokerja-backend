import { UserRole } from '@prisma/client';
import { z } from 'zod';

const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
const password = z
  .string()
  .min(8)
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must not exceed 72 UTF-8 bytes',
  );
const name = z.string().trim().min(1).max(100);

export const registerSchema = z.discriminatedUnion('role', [
  z
    .object({
      name,
      email,
      password,
      role: z.literal(UserRole.JOB_SEEKER),
    })
    .strict(),
  z
    .object({
      companyName: name,
      email,
      password,
      role: z.literal(UserRole.COMPANY),
      companyDescription: z.string().trim().max(2000).optional(),
    })
    .strict(),
]);

export const loginSchema = z
  .object({
    email,
    password,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
