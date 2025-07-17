import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/users.service';
import { AuthRequest } from '../../../common/interface/auth-request.interface';
import { AuthGuard } from '../../../guards/auth.guard';
import { ProfileDto } from '../dtos/profile.dto';

@ApiTags('Users')
@Controller('')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('getProfile')
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Req() req: AuthRequest) {
    return this.usersService.getProfile(req);
  }

  @Post('createProfile')
  @ApiResponse({ status: 200, description: 'Profile created successfully' })
  async createProfile(
    @Req() req: AuthRequest,
    @Body() createProfileDto: ProfileDto,
  ) {
    return this.usersService.createProfile(req, createProfileDto);
  }

  @Put('updateProfile')
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Req() req: AuthRequest,
    @Body() updateProfileDto: ProfileDto,
  ) {
    return this.usersService.updateProfile(req, updateProfileDto);
  }
}
