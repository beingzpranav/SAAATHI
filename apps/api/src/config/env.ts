import dotenv from 'dotenv';
import { apiEnvSchema, type ApiEnv } from '@saathi/shared';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates process environment against Zod schema.
 * Exits process immediately with a formatted error if configuration is invalid.
 */
function loadEnv(): ApiEnv {
  // Provide test defaults if running inside automated tests
  if (process.env.NODE_ENV === 'test') {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ||
      'postgresql://saathi_user:saathi_password@localhost:5432/saathi_test_db';
    process.env.JWT_ACCESS_SECRET =
      process.env.JWT_ACCESS_SECRET || 'test_jwt_access_secret_key_minimum_32_characters_saathi';
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || 'test_jwt_refresh_secret_key_minimum_32_characters_saathi';
  }

  const parsed = apiEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    const errorMessage = `FATAL: Environment validation failed:\n${issues}`;
    process.stderr.write(`${errorMessage}\n`);
    throw new Error(errorMessage);
  }

  return parsed.data;
}

export const env: ApiEnv = loadEnv();
