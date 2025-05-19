import { Global, Module } from '@nestjs/common';
import { HashingProtocolService } from './hashing/hashing-protocol.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: HashingProtocolService,
      useClass: BcryptService,
    },
    AuthService,
  ],
  exports: [HashingProtocolService],
  controllers: [AuthController],
})
export class AuthModule {}
