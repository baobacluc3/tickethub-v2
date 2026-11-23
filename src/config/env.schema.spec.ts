import { validateEnv } from './env.schema';

describe('validateEnv', () => {
  const validDatabaseUrl =
    'postgresql://tickethub:tickethub_dev_password@localhost:5432/tickethub';

  it('parses minimal valid environment and applies defaults', () => {
    const env = validateEnv({
      DATABASE_URL: validDatabaseUrl,
    });

    expect(env).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: validDatabaseUrl,
      DB_SSL: false,
      DB_LOGGING: false,
      DB_POOL_MAX: 10,
      SWAGGER_ENABLED: true,
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
    });

    expect(env).toEqual({
      NODE_ENV: 'production',
      PORT: 8080,
      DATABASE_URL: 'postgres://user:pass@db.example.com:5432/app',
      DB_SSL: true,
      DB_LOGGING: true,
      DB_POOL_MAX: 25,
      SWAGGER_ENABLED: false,
    });
  });

  it('throws a clear error when DATABASE_URL is missing or empty', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
    expect(() => validateEnv({ DATABASE_URL: '' })).toThrow(/DATABASE_URL/);
  });

  it('throws when DATABASE_URL is not a postgres connection string', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'mysql://user:pass@localhost:3306/app',
      }),
    ).toThrow(/postgres:\/\/ or postgresql:\/\//);
  });

  it('throws when PORT or NODE_ENV are invalid', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        PORT: '0',
      }),
    ).toThrow(/PORT/);

    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        PORT: '99999',
      }),
    ).toThrow(/PORT/);

    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        PORT: 'abc',
      }),
    ).toThrow(/PORT/);

    expect(() =>
      validateEnv({
        DATABASE_URL: validDatabaseUrl,
        NODE_ENV: 'staging',
      }),
    ).toThrow(/NODE_ENV/);
  });
});
