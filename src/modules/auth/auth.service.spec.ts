import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError } from 'typeorm';

import { AuthService, DUMMY_PASSWORD_HASH } from './auth.service';
import { UsersService } from '../users/users.service';
import { PasswordHasherService } from './password-hasher.service';
import { UserRole } from '../users/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { UserEntity } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let authService: AuthService;

  // Mock dependencies
  let usersService: {
    findByEmail: jest.Mock<(email: string) => Promise<UserEntity | null>>;
    create: jest.Mock<
      (input: {
        email: string;
        passwordHash: string;
        role: UserRole;
      }) => Promise<UserEntity>
    >;
  };

  let passwordHasher: {
    hash: jest.Mock<(password: string) => Promise<string>>;
    verify: jest.Mock<
      (passwordHash: string, plainPassword: string) => Promise<boolean>
    >;
  };

  let jwtService: {
    signAsync: jest.Mock<
      (payload: {
        sub: string;
        email: string;
        role: UserRole;
      }) => Promise<string>
    >;
  };

  // Test data
  const dto: RegisterDto = {
    email: '  Alice@Example.com  ',
    password: 'Password123!',
  };

  const fakeUser = {
    id: 'user-123',
    email: 'alice@example.com',
    passwordHash: '$argon2id$fake-hash',
    role: UserRole.CUSTOMER,
    createdAt: new Date('2026-11-24T02:45:00.000Z'),
    updatedAt: new Date('2026-11-24T02:45:00.000Z'),
  };

  beforeEach(async () => {
    // TODO 1: Initialize mocks with jest.fn()
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };

    // TODO 2: Configure mock return values
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue(fakeUser);
    passwordHasher.hash.mockResolvedValue('$argon2id$fake-hash');
    passwordHasher.verify.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: PasswordHasherService,
          useValue: passwordHasher,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register successfully', async () => {
      // TODO 3: Call authService.register(dto)
      const result = await authService.register(dto);

      // TODO 4: Check password hashing
      expect(passwordHasher.hash).toHaveBeenCalledWith('Password123!');

      // TODO 5: Check create arguments
      // email should be lowercase and trimmed
      // role should default to CUSTOMER
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'alice@example.com',
        passwordHash: '$argon2id$fake-hash',
        role: UserRole.CUSTOMER,
      });

      // TODO 6: Check JWT payload
      // { sub: user.id, email: user.email, role: user.role }
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: fakeUser.id,
        email: fakeUser.email,
        role: fakeUser.role,
      });

      // TODO 7: Check response structure
      // accessToken, tokenType, user
      // createdAt should be ISO string
      // passwordHash must not exist in response
      expect(result).toEqual({
        accessToken: 'jwt-token',
        tokenType: 'Bearer',
        user: {
          id: fakeUser.id,
          email: fakeUser.email,
          role: fakeUser.role,
          createdAt: fakeUser.createdAt.toISOString(),
        },
      });
    });

    it('should preserve ORGANIZER role', async () => {
      // TODO 8: Create DTO with role ORGANIZER
      const organizerDto: RegisterDto = {
        email: 'organizer@example.com',
        password: 'Password123!',
        role: UserRole.ORGANIZER,
      };
      // TODO 9: Call register()
      const result = await authService.register(organizerDto);

      // TODO 10: Expect create() to receive ORGANIZER
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'organizer@example.com',
        passwordHash: '$argon2id$fake-hash',
        role: UserRole.ORGANIZER,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      // TODO 11: Make findByEmail return fakeUser
      usersService.findByEmail.mockResolvedValue(fakeUser);

      // TODO 12: Expect register() to reject with ConflictException
      await expect(authService.register(dto)).rejects.toThrow(
        ConflictException,
      );

      // TODO 13: Ensure hash() and create() were never called
      expect(passwordHasher.hash).toHaveBeenCalledTimes(0);
      expect(usersService.create).toHaveBeenCalledTimes(0);
    });

    it('should handle PostgreSQL duplicate email race condition', async () => {
      // TODO 14: Make findByEmail return null
      usersService.findByEmail.mockResolvedValue(null);

      // TODO 15: Create a fake QueryFailedError
      // driverError.code should equal '23505'
      const driverError = Object.assign(new Error('duplicate key'), {
        code: '23505',
      });

      const duplicateError = new QueryFailedError(
        'INSERT INTO users ...',
        [],
        driverError,
      );

      // TODO 16: Make create() reject with that error
      usersService.create.mockRejectedValue(duplicateError);

      // TODO 17: Expect ConflictException
      await expect(authService.register(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginDto = {
        email: '  ALICE@EXAMPLE.COM  ',
        password: 'Password123!',
      };

      usersService.findByEmail.mockResolvedValue(fakeUser);
      passwordHasher.verify.mockResolvedValue(true);

      const result = await authService.login(loginDto);

      // TODO: Write
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'alice@example.com',
      );

      expect(passwordHasher.verify).toHaveBeenCalledWith(
        fakeUser.passwordHash,
        'Password123!',
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: fakeUser.id,
        email: fakeUser.email,
        role: fakeUser.role,
      });

      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      const loginDto: LoginDto = {
        email: 'unknown@example.com',
        password: 'Password123!',
      };

      usersService.findByEmail.mockResolvedValue(null);

      passwordHasher.verify.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );

      expect(passwordHasher.verify).toHaveBeenCalledTimes(1);

      expect(passwordHasher.verify).toHaveBeenCalledWith(
        DUMMY_PASSWORD_HASH,
        'Password123!',
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'alice@example.com',
        password: 'WrongPassword123!',
      };

      usersService.findByEmail.mockResolvedValue(fakeUser);
      passwordHasher.verify.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );

      expect(passwordHasher.verify).toHaveBeenCalledWith(
        fakeUser.passwordHash,
        'WrongPassword123!',
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
