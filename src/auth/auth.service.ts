import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProtocolService } from './hashing/hashing-protocol.service';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingProtocolService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOneBy({
      email: loginDto.email,
    });

    if (!user) throw new UnauthorizedException('Non-existing user!');

    const passwordIsValid: boolean = await this.hashingService.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException("Passwords don't match!");
    }

    return await this.createTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync<TokenPayloadDto>(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );

      const user = await this.userRepository.findOneBy({ id: sub });

      if (!user) throw new Error('User not found...');

      return this.createTokens(user);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private async createTokens(user: User) {
    const accessToken = await this.signJwtAsync<Partial<User>>(
      user.id,
      this.jwtConfiguration.jwtTtl,
      { email: user.email },
    );

    const refreshToken = await this.signJwtAsync(
      user.id,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
