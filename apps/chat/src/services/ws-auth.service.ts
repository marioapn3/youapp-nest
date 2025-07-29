import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { WsToken, WsTokenDocument } from '../schemas/ws-token.schema';
import * as crypto from 'crypto';

@Injectable()
export class WsAuthService {
  constructor(
    @InjectModel(WsToken.name) private wsTokenModel: Model<WsTokenDocument>,
    private jwtService: JwtService,
  ) {}

  async createWsToken(payload: {
    userId: string;
    username: string;
    email: string;
  }) {
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await this.wsTokenModel.updateMany(
        { userId: payload.userId, isActive: true },
        { isActive: false },
      );

      await this.wsTokenModel.create({
        token,
        userId: payload.userId,
        username: payload.username,
        email: payload.email,
        isActive: true,
        expiresAt,
      });

      return token;
    } catch (error) {
      console.error('Error creating ws token:', error);
      throw error;
    }
  }

  async validateWsToken(token: string): Promise<WsTokenDocument | null> {
    if (!token) {
      return null;
    }

    const cleanToken = token.replace('Bearer ', '');

    const wsToken = await this.wsTokenModel.findOne({
      token: cleanToken,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!wsToken) {
      return null;
    }

    wsToken.lastUsedAt = new Date();
    await wsToken.save();

    return wsToken;
  }

  async findTokenWs(
    token: string,
    isActive: boolean,
    currentDate: Date,
  ): Promise<WsTokenDocument | null> {
    const cleanToken = token.replace('Bearer ', '');

    const wsToken = await this.wsTokenModel.findOne({
      token: cleanToken,
      isActive,
      expiresAt: { $gt: currentDate },
    });

    if (!wsToken) {
      return null;
    }

    wsToken.lastUsedAt = new Date();
    await wsToken.save();

    return wsToken;
  }

  async revokeWsToken(token: string): Promise<void> {
    const cleanToken = token.replace('Bearer ', '');
    await this.wsTokenModel.updateOne(
      { token: cleanToken },
      { isActive: false },
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.wsTokenModel.updateMany(
      { userId, isActive: true },
      { isActive: false },
    );
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.wsTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }
}
