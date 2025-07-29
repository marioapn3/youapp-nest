import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class Message {
  _id: Types.ObjectId;

  get id(): string {
    return this._id.toString();
  }

  @Prop({ required: true })
  room_id: string;

  @Prop({ required: true })
  sender_id: string;

  @Prop({ required: false, type: String, default: '' })
  sender_name: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: false })
  is_read: boolean;

  @Prop({ required: true })
  created_at: Date;
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);
