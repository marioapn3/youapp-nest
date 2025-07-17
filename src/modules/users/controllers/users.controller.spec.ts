/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from '../services/users.service';
import { ProfileDto } from '../dtos/profile.dto';
import { AuthRequest } from '../../../common/interface/auth-request.interface';
import { AuthGuard } from '../../../guards/auth.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getProfile: jest.fn(),
    createProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should call userService.getProfile and return result', async () => {
      const req = { userId: '1' } as AuthRequest;
      const result = { id: '1', username: 'user' };
      mockUserService.getProfile.mockResolvedValue(result);
      expect(await controller.getProfile(req)).toEqual(result);
      expect(mockUserService.getProfile).toHaveBeenCalledWith(req);
    });
  });

  describe('createProfile', () => {
    it('should call userService.createProfile and return result', async () => {
      const req = { userId: '1' } as AuthRequest;
      const dto: ProfileDto = { name: 'test' } as any;
      const result = { id: '1', name: 'test' };
      mockUserService.createProfile.mockResolvedValue(result);
      expect(await controller.createProfile(req, dto)).toEqual(result);
      expect(mockUserService.createProfile).toHaveBeenCalledWith(req, dto);
    });
  });

  describe('updateProfile', () => {
    it('should call userService.updateProfile and return result', async () => {
      const req = { userId: '1' } as AuthRequest;
      const dto: ProfileDto = { name: 'test2' } as any;
      const result = { id: '1', name: 'test2' };
      mockUserService.updateProfile.mockResolvedValue(result);
      expect(await controller.updateProfile(req, dto)).toEqual(result);
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(req, dto);
    });
  });
});
