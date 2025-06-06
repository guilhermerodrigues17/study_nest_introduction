import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { TokenPayloadDto } from '../dto/token-payload.dto';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeaders(request);

    if (!token) throw new UnauthorizedException('User not logged in');

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayloadDto>(
        token,
        this.jwtConfiguration,
      );

      const user = await this.userRepository.findOneBy({
        id: payload.sub,
        active: true,
      });

      if (!user) {
        throw new UnauthorizedException('Unauthorized or non-existent user...');
      }

      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }

    return true;
  }

  extractTokenFromHeaders(request: Request): string | undefined {
    const authorization = request.headers?.authorization;

    if (!authorization) {
      return;
    }

    return authorization.split(' ')[1];
  }
}
