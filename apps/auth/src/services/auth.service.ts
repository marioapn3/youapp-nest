import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { User, UserDocument } from '../schemas/auth.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from '../dtos/requests/register.dto';
import { LoginUserDto } from '../dtos/requests/login.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async register(registerDto: RegisterUserDto) {
    if (registerDto.password !== registerDto.password_confirmation) {
      throw new BadRequestException(
        'Password and password confirmation do not match',
      );
    }
    const checkUser = await this.userModel.findOne({
      $or: [{ email: registerDto.email }, { username: registerDto.username }],
    });
    if (checkUser) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userModel.create({
      ...registerDto,
      password: hashedPassword,
    });
    return user;
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.userModel.findOne({
      $or: [{ email: loginDto.identifier }, { username: loginDto.identifier }],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const access_token = this.generateUserToken(
      user.id as string,
      user.username,
    );

    try {
      const loginEvent = {
        userId: user.id as string,
        username: user.username,
        email: user.email,
        timestamp: new Date(),
        access_token,
      };
      await this.client.emit('auth.user_login', loginEvent).toPromise();
    } catch (error) {
      console.error('Failed to publish login event:', error);
    }

    return {
      access_token,
    };
  }

  generateUserToken(user_id: string, username: string) {
    const payload = { userId: user_id, userName: username };
    return this.jwtService.sign(payload);
  }
}
