import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const userData = {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash: createUserDto.password,
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userData = {
      name: updateUserDto?.name,
      passwordHash: updateUserDto?.password,
    };

    const userUpdated = await this.userRepository.preload({
      id,
      ...userData,
    });

    if (!userUpdated) {
      throw new NotFoundException('User not found...');
    }

    return this.userRepository.save(userUpdated);
  }

  async remove(id: number) {
    const userFound = await this.userRepository.findOneBy({ id });

    if (!userFound) {
      throw new NotFoundException('User not found...');
    }

    return this.userRepository.remove(userFound);
  }
}
