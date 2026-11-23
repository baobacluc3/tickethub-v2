import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';

export interface DatabaseOptionsInput {
  url: string;
  ssl: boolean;
  logging: boolean;
  poolMax: number;
}

export function buildDataSourceOptions(
  input: DatabaseOptionsInput,
): DataSourceOptions {
  const ext = __filename.endsWith('.ts') ? 'ts' : 'js';

  return {
    type: 'postgres',
    url: input.url,
    synchronize: false,
    migrationsRun: false,
    logging: input.logging,
    ssl: input.ssl ? { rejectUnauthorized: false } : false,
    extra: {
      max: input.poolMax,
    },
    entities: [join(__dirname, '..', 'modules', '**', `*.entity.${ext}`)],
    migrations: [join(__dirname, 'migrations', `[0-9]*-*.${ext}`)],
    migrationsTableName: 'typeorm_migrations',
  };
}
