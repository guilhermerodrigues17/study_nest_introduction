import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { HashingProtocolService } from 'src/auth/hashing/hashing-protocol.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let hashingService: HashingProtocolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: HashingProtocolService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get(UserService);
    userRepository = module.get(getRepositoryToken(User));
    hashingService = module.get(HashingProtocolService);
  });

  it('userService should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'email@email.com',
        name: 'name',
        password: 'password',
      };

      const passwordHash = 'passwordHash';

      const userData = {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
      };

      const newUser = {
        id: 1,
        ...userData,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);

      const result = await userService.create(createUserDto);

      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(userRepository.create).toHaveBeenCalledWith(userData);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should throw ConflictException when email already exists in db', async () => {
      jest.spyOn(userRepository, 'save').mockRejectedValue({ code: '23505' });

      await expect(userService.create({} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw a generic Error when ConflictException is not thrown', async () => {
      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error('generic'));

      await expect(userService.create({} as any)).rejects.toThrow(
        new Error('generic'),
      );
    });
  });

  describe('findOne', () => {
    it('should return an user if it exists', async () => {
      const userId = 1;
      const userFound = {
        userId,
        email: 'email@email.com',
        name: 'name',
        passwordHash: 'passwordHash',
      };

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(userFound as any);

      const result = await userService.findOne(userId);

      expect(result).toEqual(userFound);
    });

    it('should throw NotFoundException if user doesnt exist', async () => {
      await expect(userService.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
