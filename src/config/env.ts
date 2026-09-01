import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export type JwtDuration = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

const jwtDurationSchema = z
  .string()
  .regex(/^[1-9]\d*(?:ms|s|m|h|d|w|y)$/, 'JWT_EXPIRES_IN must be a positive duration')
  .transform((value): JwtDuration => value as JwtDuration);

const jwtSecretSchema = z
  .string()
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') >= 32,
    'JWT_SECRET must be at least 32 bytes',
  );

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL wajib diisi'),
  JWT_SECRET: jwtSecretSchema,
  JWT_EXPIRES_IN: jwtDurationSchema.default('1d'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN wajib diisi'),
});

export function validateEnvironment(input: NodeJS.ProcessEnv) {
  return envSchema.parse(input);
}

export const env = validateEnvironment(process.env);
