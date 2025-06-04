import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { HashingProtocolService } from 'src/auth/hashing/hashing-protocol.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

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
            find: jest.fn(),
            preload: jest.fn(),
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

  describe('findAll', () => {
    it('should return all users from db', async () => {
      const usersMock: User[] = [
        {
          id: 1,
          email: 'email@email.com',
          name: 'name',
          passwordHash: 'passwordHash',
        } as User,
      ];

      jest.spyOn(userRepository, 'find').mockResolvedValue(usersMock);

      const result = await userService.findAll();

      expect(result).toEqual(usersMock);
    });
  });

  describe('update', () => {
    it('should update user data if it exists and is authorized', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'name',
        password: 'password',
      };
      const tokenPayload = { sub: userId };
      const passwordHash = 'passwordHash';
      const updatedUser = {
        id: userId,
        name: updateUserDto.name,
        passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(userRepository, 'preload')
        .mockResolvedValue(updatedUser as any);

      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

      const result = await userService.update(
        userId,
        updateUserDto,
        tokenPayload as any,
      );

      expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);
      expect(userRepository.preload).toHaveBeenCalledWith({
        id: userId,
        name: updateUserDto.name,
        passwordHash,
      });
      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user doesnt exist', async () => {
      const userId = 1;
      const updateUserDto = {} as UpdateUserDto;
      const tokenPayload = {} as TokenPayloadDto;

      jest.spyOn(userRepository, 'preload').mockResolvedValue(undefined);

      await expect(
        userService.update(userId, updateUserDto, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const userId = 1;
      const updateUserDto = {} as UpdateUserDto;
      const tokenPayload = { sub: 2 } as TokenPayloadDto;
      const user = { id: userId, name: 'name' };

      jest.spyOn(userRepository, 'preload').mockResolvedValue(user as User);

      await expect(
        userService.update(userId, updateUserDto, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
