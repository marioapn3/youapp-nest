import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class Room {
  _id: Types.ObjectId;

  get id(): string {
    return this._id.toString();
  }

  @Prop({ required: true })
  participants: string[];

  @Prop({ required: false, type: String, default: '' })
  last_message: string;

  @Prop({ required: false, type: String, default: '' })
  last_sender: string;

  @Prop({ required: false, type: Date, default: Date.now })
  last_message_at: Date;

  @Prop({ type: Object, default: {} })
  unread_count: {
    [key: string]: number;
  };

  @Prop({ required: false, type: Boolean, default: false })
  is_active: boolean;

  @Prop({ required: false, type: Date, default: Date.now })
  created_at?: Date;

  @Prop({ required: false, type: Date, default: Date.now })
  updated_at?: Date;
}

export type RoomDocument = HydratedDocument<Room>;
export const RoomSchema = SchemaFactory.createForClass(Room);
