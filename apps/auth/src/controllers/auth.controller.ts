import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../dtos/requests/register.dto';
import { LoginUserDto } from '../dtos/requests/login.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authServiceService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterUserDto) {
    return this.authServiceService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginUserDto) {
    return this.authServiceService.login(loginDto);
  }
}
