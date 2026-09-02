import { UserRole } from '@prisma/client';
import { z } from 'zod';

const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
const registrationPassword = z
  .string()
  .min(12, 'Password must contain at least 12 characters')
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must not exceed 72 UTF-8 bytes',
  )
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(/[^A-Za-z0-9\s]/, 'Password must contain at least one symbol');
const loginPassword = z
  .string()
  .min(1, 'Password is required')
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
      password: registrationPassword,
      role: z.literal(UserRole.JOB_SEEKER),
    })
    .strict(),
  z
    .object({
      companyName: name,
      email,
      password: registrationPassword,
      role: z.literal(UserRole.COMPANY),
      companyDescription: z.string().trim().max(2000).optional(),
    })
    .strict(),
]);

export const loginSchema = z
  .object({
    email,
    password: loginPassword,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
