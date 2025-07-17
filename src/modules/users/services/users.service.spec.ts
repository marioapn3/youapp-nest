/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { User } from '../schemas/users.schema';

// Gunakan userModel sebagai mock constructor function
const userModel: any = jest.fn();
userModel.findOne = jest.fn();
userModel.findById = jest.fn();
userModel.updateOne = jest.fn();

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    // Reset semua mock sebelum setiap test
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    userModel.mockReset && userModel.mockReset();
    userModel.findOne.mockReset();
    userModel.findById.mockReset();
    userModel.updateOne.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  describe('findbyEmailOrUsername', () => {
    it('should return user if found', async () => {
      const user = { id: '1' };
      userModel.findOne.mockResolvedValue(user);
      expect(await service.findbyEmailOrUsername('a@mail.com', 'user')).toBe(
        user,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'a@mail.com' }, { username: 'user' }],
      });
    });
    it('should return null if not found', async () => {
      userModel.findOne.mockResolvedValue(null);
      expect(
        await service.findbyEmailOrUsername('a@mail.com', 'user'),
      ).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('should save and return new user', async () => {
      const saveMock = jest.fn().mockResolvedValue({ id: '1' });
      (userModel as jest.Mock).mockImplementation(() => ({ save: saveMock }));
      const result = await service.registerUser('a@mail.com', 'user', 'pass');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      const user = { id: '1' };
      userModel.findOne.mockResolvedValue(user);
      expect(await service.findByEmail('a@mail.com')).toBe(user);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'a@mail.com' });
    });
    it('should return null if not found', async () => {
      userModel.findOne.mockResolvedValue(null);
      expect(await service.findByEmail('a@mail.com')).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      const user = {
        id: '1',
        select: jest.fn().mockResolvedValue({ id: '1' }),
      };
      userModel.findById.mockReturnValue(user);
      expect(await service.findById('1')).toEqual({ id: '1' });
      expect(userModel.findById).toHaveBeenCalledWith('1');
    });
    it('should throw if not found', async () => {
      const user = { select: jest.fn().mockResolvedValue(null) };
      userModel.findById.mockReturnValue(user);
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('should return user if found', async () => {
      const req = { userId: '1' };
      const user = {
        id: '1',
        select: jest.fn().mockResolvedValue({ id: '1' }),
      };
      userModel.findById.mockReturnValue(user);
      expect(await service.getProfile(req as any)).toEqual({ id: '1' });
    });
    it('should throw if not found', async () => {
      const req = { userId: '1' };
      const user = { select: jest.fn().mockResolvedValue(null) };
      userModel.findById.mockReturnValue(user);
      await expect(service.getProfile(req as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createProfile', () => {
    it('should update and return profile', async () => {
      const req = { userId: '1' };
      const profile = { name: 'test' };
      service.getProfile = jest.fn().mockResolvedValue({ _id: '1' });
      userModel.updateOne.mockResolvedValue({});
      service.getProfile = jest
        .fn()
        .mockResolvedValueOnce({ _id: '1' })
        .mockResolvedValueOnce({ ...profile, _id: '1' });
      const result = await service.createProfile(req as any, profile as any);
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: '1' },
        { $set: profile },
      );
      expect(result).toEqual({ ...profile, _id: '1' });
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile', async () => {
      const req = { userId: '1' };
      const profile = { name: 'test' };
      service.getProfile = jest.fn().mockResolvedValue({ _id: '1' });
      userModel.updateOne.mockResolvedValue({});
      service.getProfile = jest
        .fn()
        .mockResolvedValueOnce({ _id: '1' })
        .mockResolvedValueOnce({ ...profile, _id: '1' });
      const result = await service.updateProfile(req as any, profile as any);
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: '1' },
        { $set: profile },
      );
      expect(result).toEqual({ ...profile, _id: '1' });
    });
  });
});
