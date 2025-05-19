import { Global, Module } from '@nestjs/common';
import { HashingProtocolService } from './hashing/hashing-protocol.service';
import { BcryptService } from './hashing/bcrypt.service';

@Global()
@Module({
  providers: [
    {
      provide: HashingProtocolService,
      useClass: BcryptService,
    },
  ],
  exports: [HashingProtocolService],
})
export class AuthModule {}
