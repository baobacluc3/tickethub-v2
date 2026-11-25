import { PasswordHasherService } from './password-hasher.service';
import { beforeEach, describe, it, expect } from '@jest/globals';

describe('PasswordHasherService', () => {
  let service: PasswordHasherService;

  beforeEach(() => {
    service = new PasswordHasherService();
  });

  // Ví dụ 1 (mẫu cho hash)
  it('hashes a password into an argon2id PHC string', async () => {
    const password = 'StrongP@ss123';

    const hash = await service.hash(password);

    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  // Ví dụ 2 (mẫu cho verify)
  it('returns true when password matches the hash', async () => {
    const password = 'StrongP@ss123';
    const hash = await service.hash(password);

    const isValid = await service.verify(hash, password);

    expect(isValid).toBe(true);
  });

  // TODO 3: Hash cùng 1 password 2 lần phải ra 2 chuỗi khác nhau (random salt)
  // Gợi ý: expect(hash1).not.toBe(hash2);
  it('generates different hashes for the same password (random salt)', async () => {
    const password = 'StrongP@ss123';
    const hash1 = await service.hash(password);
    const hash2 = await service.hash(password);
    expect(hash1).not.toBe(hash2);
  });

  // TODO 4: verify trả về false khi sai password (thử sai chữ hoa/thường hoặc thêm khoảng trắng)
  // Gợi ý: expect(isValid).toBe(false);
  it('returns false when password does not match the hash', async () => {
    const password = 'StrongP@ss123';
    const wrongPassword = 'strongpass123';

    const hash = await service.hash(password);

    const isValid = await service.verify(hash, wrongPassword);

    expect(isValid).toBe(false);
  });
  // TODO 5: verify trả về false (không throw) khi hash sai định dạng hoặc rỗng
  // Gợi ý: await service.verify('not-a-valid-hash', 'StrongP@ss123') -> toBe(false)
  it('returns false when hash is invalid or empty', async () => {
    const password = 'StrongP@ss123';

    const invalidHashResult = await service.verify(
      'not-a-valid-hash',
      password,
    );

    const emptyHashResult = await service.verify('', password);

    expect(invalidHashResult).toBe(false);
    expect(emptyHashResult).toBe(false);
  });

  // TODO 6: hash('') phải reject / throw error
  // Gợi ý: await expect(service.hash('')).rejects.toThrow();
  it('throws an error when hashing an empty password', async () => {
    await expect(service.hash('')).rejects.toThrow();
  });
});
