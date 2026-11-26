import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from './user-role.enum';
import type { UserEntity } from './user.entity';
import { UsersController } from './users.controller';
import type { UsersService } from './users.service';

describe('UsersController', () => {
  let findByIdMock: jest.Mock;
  let usersController: UsersController;

  beforeEach(() => {
    findByIdMock = jest.fn();
    const mockUsersService = {
      findById: findByIdMock,
    } as unknown as UsersService;

    usersController = new UsersController(mockUsersService);
  });

  it('returns UserResponseDto without passwordHash for the current user', async () => {
    const now = new Date('2026-11-26T07:00:00.000Z');
    const entity: UserEntity = {
      id: '7f2e7f48-2b6e-4c4e-9df2-6d9d2e69c5d1',
      email: 'alice@example.com',
      passwordHash: '$argon2id$secret-hash',
      role: UserRole.CUSTOMER,
      createdAt: now,
      updatedAt: now,
    };
    findByIdMock.mockResolvedValue(entity);

    const result = await usersController.getMe({
      id: entity.id,
      email: entity.email,
      role: entity.role,
    });

    expect(findByIdMock).toHaveBeenCalledWith(entity.id);
    expect(result).toEqual({
      id: entity.id,
      email: entity.email,
      role: entity.role,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect('passwordHash' in result).toBe(false);
    expect(JSON.stringify(result)).not.toContain('passwordHash');
    expect(JSON.stringify(result)).not.toContain('$argon2id$secret-hash');
  });

  it('throws UnauthorizedException when the user no longer exists', async () => {
    findByIdMock.mockResolvedValue(null);

    await expect(
      usersController.getMe({
        id: 'missing-id',
        email: 'missing@example.com',
        role: UserRole.CUSTOMER,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
