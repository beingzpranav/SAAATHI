import { webEnvSchema, type WebEnv } from '@saathi/shared';

/**
 * Validates Vite client environment variables.
 * Fails fast if required variables are missing or malformed.
 */
function loadWebEnv(): WebEnv {
  const envSource = {
    VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  const parsed = webEnvSchema.safeParse(envSource);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Client environment validation failed:\n${issues}`);
  }

  return parsed.data;
}

export const env: WebEnv = loadWebEnv();
