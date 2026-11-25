import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PasswordHasherService } from './password-hasher.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { UserRole } from '../users/user-role.enum';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './types/jwt-payload';

export const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$3/6fLRRiJOm0hiijc8Os5Q$vEWu181n3lQJhqK5cJxh7EkvSce/07Y/7MxGD7/Hc24';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasherService: PasswordHasherService,
    private readonly jwtService: JwtService,
  ) {}

  private async buildAuthResponse(
    user: UserEntity,
  ): Promise<RegisterResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const role = dto.role ?? UserRole.CUSTOMER;
    const duplicate = await this.usersService.findByEmail(email);
    if (duplicate) {
      throw new ConflictException('Unable to complete registration');
    }

    const passwordHash = await this.passwordHasherService.hash(dto.password);

    try {
      const user = await this.usersService.create({
        email,
        passwordHash,
        role,
      });

      return this.buildAuthResponse(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Unable to complete registration');
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);
    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isPasswordValid = await this.passwordHasherService.verify(
      passwordHash,
      dto.password,
    );
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(user);
  }
}
