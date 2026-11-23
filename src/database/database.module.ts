import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Env } from '../config/env.schema';
import { buildDataSourceOptions } from './database-options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) =>
        buildDataSourceOptions({
          url: configService.get('DATABASE_URL', { infer: true }),
          ssl: configService.get('DB_SSL', { infer: true }),
          logging: configService.get('DB_LOGGING', { infer: true }),
          poolMax: configService.get('DB_POOL_MAX', { infer: true }),
        }),
    }),
  ],
})
export class DatabaseModule {}
