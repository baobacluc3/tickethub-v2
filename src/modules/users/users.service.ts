import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    const newEmail = email.trim().toLowerCase();
    const user = this.usersRepository.findOne({
      where: { email: newEmail },
    });
    return user;
  }

  create(input: {
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<UserEntity> {
    const user = this.usersRepository.create(input);

    return this.usersRepository.save(user);
  }
}
