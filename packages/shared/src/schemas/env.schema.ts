import { z } from 'zod';

/**
 * API Environment Variables Schema
 */
export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters for security'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  // Translation micro-service (optional — falls back to no-op when absent)
  TRANSLATION_SERVICE_URL: z.string().url().optional().default('http://localhost:8000'),
  TRANSLATION_INTERNAL_SECRET: z.string().optional().default(''),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

/**
 * Web Client Environment Variables Schema
 */
export const webEnvSchema = z.object({
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL'),
  VITE_SOCKET_URL: z.string().url('VITE_SOCKET_URL must be a valid URL'),
  MODE: z.string().optional(),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
});

export type WebEnv = z.infer<typeof webEnvSchema>;
