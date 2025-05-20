import { Global, Module } from '@nestjs/common';
import { HashingProtocolService } from './hashing/hashing-protocol.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [
    {
      provide: HashingProtocolService,
      useClass: BcryptService,
    },
    AuthService,
  ],
  exports: [HashingProtocolService, JwtModule, ConfigModule],
  controllers: [AuthController],
})
export class AuthModule {}
