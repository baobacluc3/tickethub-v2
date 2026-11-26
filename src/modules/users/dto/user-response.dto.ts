import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';
import type { UserEntity } from '../user.entity';

export class UserResponseDto {
  @ApiProperty({
    example: '7f2e7f48-2b6e-4c4e-9df2-6d9d2e69c5d1',
    description: 'Unique user identifier',
  })
  id: string;

  @ApiProperty({
    example: 'alice@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.CUSTOMER,
    description: 'User role',
  })
  role: UserRole;

  @ApiProperty({
    example: '2026-11-24T02:45:00.000Z',
    description: 'ISO 8601 UTC timestamp when the user was created',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-11-24T02:45:00.000Z',
    description: 'ISO 8601 UTC timestamp when the user was last updated',
  })
  updatedAt: string;

  static fromEntity(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
