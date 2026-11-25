import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { Env } from '../../config/env.schema';
import { AuthController } from './auth.controller';
import { PasswordHasherService } from './password-hasher.service';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', { infer: true }),
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [PasswordHasherService, AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
