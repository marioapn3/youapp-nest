/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/users.schema';
import { Model } from 'mongoose';
import { AuthRequest } from 'src/common/interface/auth-request.interface';
import { ProfileDto } from '../dtos/profile.dto';
import { Helper } from 'src/utils/helper';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findbyEmailOrUsername(email: string, username: string) {
    const user = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });
    return user;
  }

  async registerUser(email: string, username: string, password: string) {
    const newUser = new this.userModel({
      email: email,
      username: username,
      password: password,
    });
    return newUser.save();
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({
      email: email,
    });
    return user;
  }

  async findById(userId) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfile(req: AuthRequest) {
    console.log(req.userId);
    const user = await this.userModel.findById(req.userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createProfile(req: AuthRequest, createProfileDto: ProfileDto) {
    const user = await this.getProfile(req);

    if (createProfileDto.birthday) {
      createProfileDto.horoscope = Helper.getHoroscope(
        createProfileDto.birthday,
      );
      createProfileDto.zodiac = Helper.getZodiac(createProfileDto.birthday);
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: createProfileDto },
    );
    return this.getProfile(req);
  }

  async updateProfile(req: AuthRequest, updateProfileDto: ProfileDto) {
    const user = await this.getProfile(req);

    // Set horoscope and zodiac based on birthday
    if (updateProfileDto.birthday) {
      updateProfileDto.horoscope = Helper.getHoroscope(
        updateProfileDto.birthday,
      );
      updateProfileDto.zodiac = Helper.getZodiac(updateProfileDto.birthday);
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: updateProfileDto },
    );
    return this.getProfile(req);
  }
}
