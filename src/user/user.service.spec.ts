import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { HashingProtocolService } from 'src/auth/hashing/hashing-protocol.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

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
            remove: jest.fn(),
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

  describe('remove', () => {
    it('should remove an user', async () => {
      const userId = 1;
      const tokenPayload = { sub: userId } as TokenPayloadDto;
      const user = { id: userId, name: 'name' };

      jest.spyOn(userService, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(user as User);

      const result = await userService.remove(userId, tokenPayload);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userRepository.remove).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const userId = 1;
      const tokenPayload = { sub: 2 } as TokenPayloadDto;
      const user = { id: userId, name: 'name' };

      jest.spyOn(userService, 'findOne').mockResolvedValue(user as User);

      await expect(userService.remove(userId, tokenPayload)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if user doesnt exist', async () => {
      const userId = 1;
      const tokenPayload = { sub: userId } as TokenPayloadDto;

      jest
        .spyOn(userService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(userService.remove(userId, tokenPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadPicture', () => {
    it('should save the image and update the user', async () => {
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('content'),
      } as Express.Multer.File;

      const mockUser = {
        id: 1,
        name: 'name',
        email: 'email@email.com',
      } as User;

      const mockUserWithPicture = {
        ...mockUser,
        picture: '1.png',
      };

      const mockTokenPayload = { sub: 1 } as TokenPayloadDto;
      const mockFilePath = path.resolve(process.cwd(), 'pictures', '1.png');

      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUserWithPicture);

      const result = await userService.uploadPicture(
        mockTokenPayload,
        mockFile,
      );

      expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, mockFile.buffer);
      expect(userRepository.save).toHaveBeenCalledWith(mockUserWithPicture);
      expect(result).toEqual(mockUserWithPicture);
    });

    it('should throw BadRequestException if the file is not sent', async () => {
      const mockTokenPayload = { sub: 1 } as TokenPayloadDto;

      await expect(userService.uploadPicture(mockTokenPayload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if the file size is smaller than 1024 byes', async () => {
      const mockFile = {
        originalname: 'test.png',
        size: 500,
        buffer: Buffer.from('content'),
      } as Express.Multer.File;
      const mockTokenPayload = { sub: 1 } as TokenPayloadDto;

      await expect(
        userService.uploadPicture(mockTokenPayload, mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
