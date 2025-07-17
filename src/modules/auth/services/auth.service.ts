import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from '../schemas/token.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from '../dtos/requests/register.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { AuthRequest } from '../../../common/interface/auth-request.interface';
import { LoginUserDto } from '../dtos/requests/login.dto';
import { RefreshDto } from '../dtos/requests/refresh.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}
  async register(registerDto: RegisterUserDto) {
    const checkUser = await this.userService.findbyEmailOrUsername(
      registerDto.email,
      registerDto.username,
    );
    if (checkUser) {
      throw new BadRequestException('Email or username already in use');
    }
    const hashedPassword: string = await bcrypt.hash(registerDto.password, 10);

    if (registerDto.password !== registerDto.password_confirmation) {
      throw new BadRequestException(
        'Password and password confirmation must match',
      );
    }

    const user = await this.userService.registerUser(
      registerDto.email,
      registerDto.username,
      hashedPassword,
    );

    return user;
  }

  verifyToken(token: string): AuthRequest {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token' + err);
    }
  }

  async login(loginDto: LoginUserDto) {
    const { identifier, password } = loginDto;
    const user = await this.userService.findbyEmailOrUsername(
      identifier,
      identifier,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateUserToken(user.id as string);
    const refreshToken = uuidv4();
    const socketToken = uuidv4();

    await this.tokenModel.create({
      token: refreshToken,
      userId: user.id as string,
      type: 'refresh',
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      active: true,
    });
    await this.tokenModel.create({
      token: socketToken,
      userId: user.id as string,
      type: 'ws',
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      active: true,
    });

    return {
      accessToken,
      refreshToken,
      socketToken,
      userId: user.id as string,
    };
  }

  generateUserToken(userId: string) {
    const TokenPayload = {
      userId: userId,
    };
    const accessToken = this.jwtService.sign(TokenPayload, { expiresIn: '1d' });
    return accessToken;
  }

  async refreshToken(refreshToken: RefreshDto) {
    const token = await this.tokenModel.findOne({
      token: refreshToken.refreshToken,
      expiryDate: { $gte: new Date() },
    });
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.findById(token.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const accessToken = this.generateUserToken(user.id as string);
    return { accessToken };
  }

  async logout(userId: string) {
    await this.tokenModel.deleteMany({
      userId: userId,
      type: 'refresh',
    });

    await this.tokenModel.deleteMany({
      userId: userId,
      type: 'ws',
    });

    return { message: 'Logged out successfully' };
  }

  async findTokenWs(token: string, active: boolean, expiryDate: Date) {
    return this.tokenModel.findOne({
      token,
      active,
      type: 'ws',
      expiryDate: { $gt: expiryDate },
    });
  }
}
