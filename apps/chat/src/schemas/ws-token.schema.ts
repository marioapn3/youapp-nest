import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WsTokenDocument = WsToken & Document;

@Schema({
  timestamps: true,
  collection: 'ws_tokens',
})
export class WsToken {
  @Prop({ required: true, index: true })
  token: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  lastUsedAt: Date;
}

export const WsTokenSchema = SchemaFactory.createForClass(WsToken);

WsTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
WsTokenSchema.index({ token: 1, isActive: 1 });
