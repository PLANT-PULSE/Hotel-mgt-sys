import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  async verify(password: string, hash: string): Promise<boolean> {
    if (hash.startsWith('$argon2')) {
      return argon2.verify(hash, password);
    }
    // Legacy bcrypt hashes from existing seed data
    return bcrypt.compare(password, hash);
  }
}
