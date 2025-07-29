import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthRequest } from '@app/common';
import { ProfileDto } from '../dtos/profile.dtos';

@ApiTags('Users')
@Controller('')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('getProfile')
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Req() req: AuthRequest) {
    return this.profileService.getProfile(req.userId as string);
  }

  @Post('createProfile')
  @ApiResponse({ status: 200, description: 'Profile created successfully' })
  async createProfile(
    @Req() req: AuthRequest,
    @Body() createProfileDto: ProfileDto,
  ) {
    console.log(req);
    return this.profileService.createProfile(
      createProfileDto,
      req.userId as string,
    );
  }

  @Put('updateProfile')
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Req() req: AuthRequest,
    @Body() updateProfileDto: ProfileDto,
  ) {
    return this.profileService.updateProfile(
      updateProfileDto,
      req.userId as string,
    );
  }
}
