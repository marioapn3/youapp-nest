/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/services/users.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Token } from '../schemas/token.schema';
import { RegisterUserDto } from '../dtos/requests/register.dto';
import { LoginUserDto } from '../dtos/requests/login.dto';
import { RefreshDto } from '../dtos/requests/refresh.dto';

jest.mock('bcrypt');
jest.mock('uuid');

describe('AuthService', () => {
  let service: AuthService;
  let tokenModel: any;
  let jwtService: any;
  let userService: any;

  beforeEach(async () => {
    tokenModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      deleteMany: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };
    userService = {
      findbyEmailOrUsername: jest.fn(),
      registerUser: jest.fn(),
      findById: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(Token.name), useValue: tokenModel },
        { provide: JwtService, useValue: jwtService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw if user exists', async () => {
      userService.findbyEmailOrUsername.mockResolvedValue({});
      const dto = {
        email: 'a',
        username: 'b',
        password: 'c',
        password_confirmation: 'c',
      };
      await expect(service.register(dto as RegisterUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw if passwords do not match', async () => {
      userService.findbyEmailOrUsername.mockResolvedValue(null);
      const dto = {
        email: 'a',
        username: 'b',
        password: 'c',
        password_confirmation: 'd',
      };
      await expect(service.register(dto as RegisterUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should register user if valid', async () => {
      userService.findbyEmailOrUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      userService.registerUser.mockResolvedValue({ id: '1' });
      const dto = {
        email: 'a',
        username: 'b',
        password: 'c',
        password_confirmation: 'c',
      };
      const result = await service.register(dto as RegisterUserDto);
      expect(result).toEqual({ id: '1' });
      expect(userService.registerUser).toHaveBeenCalledWith('a', 'b', 'hashed');
    });
  });

  describe('verifyToken', () => {
    it('should return payload if valid', () => {
      jwtService.verify.mockReturnValue({ userId: '1' });
      expect(service.verifyToken('token')).toEqual({ userId: '1' });
    });
    it('should throw if invalid', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('bad');
      });
      expect(() => service.verifyToken('token')).toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      userService.findbyEmailOrUsername.mockResolvedValue(null);
      await expect(
        service.login({ identifier: 'a', password: 'b' } as LoginUserDto),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should throw if password invalid', async () => {
      userService.findbyEmailOrUsername.mockResolvedValue({
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ identifier: 'a', password: 'b' } as LoginUserDto),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should return tokens if valid', async () => {
      userService.findbyEmailOrUsername.mockResolvedValue({
        id: '1',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (uuidv4 as jest.Mock)
        .mockReturnValueOnce('refresh')
        .mockReturnValueOnce('socket');
      jest.spyOn(service, 'generateUserToken').mockReturnValue('access');
      tokenModel.create.mockResolvedValue({});
      const result = await service.login({
        identifier: 'a',
        password: 'b',
      } as LoginUserDto);
      expect(result).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
        socketToken: 'socket',
        userId: '1',
      });
    });
  });

  describe('generateUserToken', () => {
    it('should sign and return token', () => {
      jwtService.sign.mockReturnValue('jwt');
      expect(service.generateUserToken('1')).toBe('jwt');
    });
  });

  describe('refreshToken', () => {
    it('should throw if token not found', async () => {
      tokenModel.findOne.mockResolvedValue(null);
      await expect(
        service.refreshToken({ refreshToken: 'abc' } as RefreshDto),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should throw if user not found', async () => {
      tokenModel.findOne.mockResolvedValue({ userId: '1' });
      userService.findById.mockResolvedValue(null);
      await expect(
        service.refreshToken({ refreshToken: 'abc' } as RefreshDto),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should return new access token', async () => {
      tokenModel.findOne.mockResolvedValue({ userId: '1' });
      userService.findById.mockResolvedValue({ id: '1' });
      jest.spyOn(service, 'generateUserToken').mockReturnValue('jwt');
      const result = await service.refreshToken({
        refreshToken: 'abc',
      } as RefreshDto);
      expect(result).toEqual({ accessToken: 'jwt' });
    });
  });

  describe('logout', () => {
    it('should delete refresh and ws tokens', async () => {
      tokenModel.deleteMany.mockResolvedValue({});
      const result = await service.logout('1');
      expect(tokenModel.deleteMany).toHaveBeenCalledWith({
        userId: '1',
        type: 'refresh',
      });
      expect(tokenModel.deleteMany).toHaveBeenCalledWith({
        userId: '1',
        type: 'ws',
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('findTokenWs', () => {
    it('should call findOne with correct params', async () => {
      tokenModel.findOne.mockResolvedValue({ token: 'abc' });
      const result = await service.findTokenWs(
        'abc',
        true,
        new Date('2020-01-01'),
      );
      expect(tokenModel.findOne).toHaveBeenCalledWith({
        token: 'abc',
        active: true,
        type: 'ws',
        expiryDate: { $gt: new Date('2020-01-01') },
      });
      expect(result).toEqual({ token: 'abc' });
    });
  });
});
