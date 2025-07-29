import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from '../schema/profile.schema';
import { ProfileDto } from '../dtos/profile.dtos';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {}

  async createProfile(profile: ProfileDto, user_id: string): Promise<Profile> {
    const existingProfile = await this.profileModel.findOne({ user_id });
    if (existingProfile) {
      throw new BadRequestException('Profile already exists');
    }
    const newProfile = new this.profileModel({
      ...profile,
      user_id,
    });
    return newProfile.save();
  }

  async updateProfile(profile: ProfileDto, user_id: string): Promise<Profile> {
    const updatedProfile = await this.profileModel.findOneAndUpdate(
      { user_id },
      profile,
      {
        new: true,
      },
    );
    if (!updatedProfile) {
      throw new NotFoundException('Profile not found');
    }
    return updatedProfile;
  }

  async getProfile(user_id: string): Promise<Profile> {
    const profile = await this.profileModel.findOne({ user_id });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
