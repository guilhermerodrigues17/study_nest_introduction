import { HashingProtocolService } from './hashing-protocol.service';
import * as bcrypt from 'bcryptjs';

export class BcryptService extends HashingProtocolService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
