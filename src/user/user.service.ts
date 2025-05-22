import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashingProtocolService } from 'src/auth/hashing/hashing-protocol.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingProtocolService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createUserDto.password,
      );

      const userData = {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
      };

      const newUser = this.userRepository.create(userData);
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This email already exists!');
      }

      throw error;
    }
  }

  async findAll() {
    const usersFound = await this.userRepository.find();
    return usersFound;
  }

  async findOne(id: number) {
    const userFound = await this.userRepository.findOneBy({ id });

    if (!userFound) {
      throw new NotFoundException('User not found...');
    }

    return userFound;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    tokenPayloadDto: TokenPayloadDto,
  ) {
    const userData = {
      name: updateUserDto?.name,
    };

    if (updateUserDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updateUserDto.password,
      );

      userData['passwordHash'] = passwordHash;
    }

    const userUpdated = await this.userRepository.preload({
      id,
      ...userData,
    });

    if (!userUpdated) {
      throw new NotFoundException('User not found...');
    }

    if (userUpdated.id !== tokenPayloadDto.sub) {
      throw new ForbiddenException('You can only change your own data...');
    }

    return this.userRepository.save(userUpdated);
  }

  async remove(id: number, tokenPayloadDto: TokenPayloadDto) {
    const userFound = await this.userRepository.findOneBy({ id });

    if (!userFound) {
      throw new NotFoundException('User not found...');
    }

    if (userFound.id !== tokenPayloadDto.sub) {
      throw new ForbiddenException('You can only change your own data...');
    }

    return this.userRepository.remove(userFound);
  }
}
