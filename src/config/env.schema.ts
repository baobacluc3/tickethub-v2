import { z } from 'zod';

function parseBooleanEnv(defaultValue: boolean) {
  return z.preprocess((value: unknown) => {
    if (value === undefined || value === '') {
      return defaultValue;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') {
        return true;
      }
      if (normalized === 'false' || normalized === '0') {
        return false;
      }
    }
    return value;
  }, z.boolean());
}

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z
    .string({
      required_error: 'DATABASE_URL is required',
      invalid_type_error: 'DATABASE_URL must be a string',
    })
    .trim()
    .min(1, 'DATABASE_URL cannot be empty')
    .refine(
      (val) => val.startsWith('postgres://') || val.startsWith('postgresql://'),
      {
        message: 'DATABASE_URL must start with postgres:// or postgresql://',
      },
    ),
  DB_SSL: parseBooleanEnv(false),
  DB_LOGGING: parseBooleanEnv(false),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  SWAGGER_ENABLED: parseBooleanEnv(true),
  JWT_SECRET: z
    .string({
      required_error: 'JWT_SECRET is required',
      invalid_type_error: 'JWT_SECRET must be a string',
    })
    .trim()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z
    .string()
    .trim()
    .regex(
      /^\d+(ms|s|m|h|d)$/,
      'JWT_EXPIRES_IN must be a valid duration such as 15m, 1h, or 900s',
    )
    .default('15m'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'env';
        return `  - ${path}: ${issue.message}`;
      })
      .join('\n');

    throw new Error(`Environment variable validation failed:\n${issues}`);
  }

  return result.data;
}
