/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../dtos/requests/register.dto';
import { LoginUserDto } from '../dtos/requests/login.dto';
import { RefreshDto } from '../dtos/requests/refresh.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto: RegisterUserDto = {
        email: 'test@mail.com',
        username: 'user',
        password: 'pass123',
        password_confirmation: 'pass123',
      };
      const result = { id: '1', email: dto.email };
      mockAuthService.register.mockResolvedValue(result);
      expect(await controller.register(dto)).toEqual(result);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto: LoginUserDto = {
        identifier: 'user',
        password: 'pass123',
      };
      const result = {
        accessToken: 'token',
        refreshToken: 'refresh',
        socketToken: 'socket',
        userId: '1',
      };
      mockAuthService.login.mockResolvedValue(result);
      expect(await controller.login(dto)).toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshToken and return result', async () => {
      const dto: RefreshDto = { refreshToken: 'refresh' };
      const result = { accessToken: 'token' };
      mockAuthService.refreshToken.mockResolvedValue(result);
      expect(await controller.refresh(dto)).toEqual(result);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(dto);
    });
  });
});
