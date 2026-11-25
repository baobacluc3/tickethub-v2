import { validateEnv } from './env.schema';

describe('validateEnv', () => {
  const validDatabaseUrl =
    'postgresql://tickethub:tickethub_dev_password@localhost:5432/tickethub';
  const validJwtSecret = 'dev_secret_key_that_is_at_least_32_characters_long';

  it('parses minimal valid environment and applies defaults', () => {
    const env = validateEnv({
      DATABASE_URL: validDatabaseUrl,
      JWT_SECRET: validJwtSecret,
    });

    expect(env).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: validDatabaseUrl,
      DB_SSL: false,
      DB_LOGGING: false,
      DB_POOL_MAX: 10,
      SWAGGER_ENABLED: true,
      JWT_SECRET: validJwtSecret,
      JWT_EXPIRES_IN: '15m',
    });
  });

  it('coerces boolean string variants and numeric values', () => {
    const env = validateEnv({
      NODE_ENV: 'production',
      PORT: '8080',
      DATABASE_URL: 'postgres://user:pass@db.example.com:5432/app',
      DB_SSL: 'true',
      DB_LOGGING: '1',
      DB_POOL_MAX: '25',
      SWAGGER_ENABLED: '0',
      JWT_SECRET: validJwtSecret,
      JWT_EXPIRES_IN: '1h',
    });

    expect(env).toEqual({
      NODE_ENV: 'production',
      PORT: 8080,
      DATABASE_URL: 'postgres://user:pass@db.example.com:5432/app',
      DB_SSL: true,
      DB_LOGGING: true,
      DB_POOL_MAX: 25,
      SWAGGER_ENABLED: false,
      JWT_SECRET: validJwtSecret,
      JWT_EXPIRES_IN: '1h',
    });
  });

  it('throws a clear error when DATABASE_URL is missing or empty', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
    expect(() =>
      validateEnv({ DATABASE_URL: '', JWT_SECRET: validJwtSecret }),
    ).toThrow(/DATABASE_URL/);
  });

  it('throws when DATABASE_URL is not a postgres connection string', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'mysql://user:pass@localhost:3306/app',
        JWT_SECRET: validJwtSecret,
      }),
    ).toThrow(/postgres:\/\/ or postgresql:\/\//);
  });

  it('throws when PORT or NODE_ENV are invalid', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        JWT_SECRET: validJwtSecret,
        PORT: '0',
      }),
    ).toThrow(/PORT/);

    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        JWT_SECRET: validJwtSecret,
        PORT: '99999',
      }),
    ).toThrow(/PORT/);

    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        JWT_SECRET: validJwtSecret,
        PORT: 'abc',
      }),
    ).toThrow(/PORT/);

    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        JWT_SECRET: validJwtSecret,
        NODE_ENV: 'staging',
      }),
    ).toThrow(/NODE_ENV/);
  });

  it('throws when JWT_SECRET is missing or shorter than 32 characters', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
      }),
    ).toThrow(/JWT_SECRET/);

    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        JWT_SECRET: 'too_short',
      }),
    ).toThrow(/JWT_SECRET/);
  });

  it('throws when JWT_EXPIRES_IN has an invalid duration format', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        JWT_SECRET: validJwtSecret,
        JWT_EXPIRES_IN: 'abc',
      }),
    ).toThrow(/JWT_EXPIRES_IN/);

    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        JWT_SECRET: validJwtSecret,
        JWT_EXPIRES_IN: '15',
      }),
    ).toThrow(/JWT_EXPIRES_IN/);
  });
});
