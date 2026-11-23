import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { validateEnv } from '../config/env.schema';
import { buildDataSourceOptions } from './database-options';

loadEnv({ path: process.env.ENV_FILE ?? '.env' });

const env = validateEnv(process.env);

const dataSource = new DataSource(
  buildDataSourceOptions({
    url: env.DATABASE_URL,
    ssl: env.DB_SSL,
    logging: env.DB_LOGGING,
    poolMax: env.DB_POOL_MAX,
  }),
);

export default dataSource;
