import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

const ARGON2_OPTIONS: Readonly<argon2.HashOptions> = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

@Injectable()
export class PasswordHasherService {
  async hash(plainPassword: string): Promise<string> {
    if (!plainPassword) {
      throw new Error('password must not be empty');
    }
    return argon2.hash(plainPassword, ARGON2_OPTIONS);
  }

  async verify(passwordHash: string, plainPassword: string): Promise<boolean> {
    if (!passwordHash || !plainPassword) {
      return false;
    }

    try {
      return await argon2.verify(passwordHash, plainPassword);
    } catch {
      return false;
    }
  }
}
