import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Schema({
  timestamps: true,
})
export class Profile extends Document {
  @Prop({
    required: true,
    unique: true,
  })
  user_id: string;

  @Prop({ default: '' })
  about?: string;

  @Prop({ default: '' })
  avatar?: string;

  @Prop({ type: [String], default: [] })
  interests?: string[];

  @Prop({ default: '' })
  display_name?: string;

  @Prop({ type: String, enum: Gender, default: null })
  gender?: Gender | null;

  @Prop({ type: Date, default: null })
  birthday?: Date | null;

  @Prop({ default: '' })
  horoscope?: string;

  @Prop({ default: '' })
  zodiac?: string;

  @Prop({ default: '' })
  weight?: string;

  @Prop({ default: '' })
  height?: string;
}

export type ProfileDocument = Profile & Document;
export const ProfileSchema = SchemaFactory.createForClass(Profile);
