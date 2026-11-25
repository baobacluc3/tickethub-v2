import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath:
        process.env.NODE_ENV === 'test'
          ? ['.env.test.local', '.env.test', '.env']
          : ['.env.local', '.env'],
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
