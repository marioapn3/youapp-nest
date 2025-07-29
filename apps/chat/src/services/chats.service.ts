import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { Room } from '../schemas/room.schema';
import { SendMessageDto } from '../dtos/requests/sendMessage.dto';
import { AuthRequest } from '@app/common';
import {
  FindMessageQueryDto,
  PaginationDto,
} from '../dtos/requests/pagination.dto';
import { ChatGateway } from '../gateways/chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Room.name) private roomModel: Model<Room>,
    @Inject(forwardRef(() => ChatGateway))
    protected chatGateway: ChatGateway,
  ) {}

  async sendMessage(
    message: SendMessageDto,
    req: AuthRequest,
  ): Promise<Message> {
    let room = await this.findRoomById(message.roomId);
    const senderId = req.userId?.toString() || '';
    const senderName = req.userName || '';
    if (!room) {
      const receiverId = message.receiverId;
      if (!receiverId) {
        throw new BadRequestException('Receiver ID is required');
      }
      const newRoom = await this.createRoom({
        participants: [req.userId?.toString() || '', receiverId],
        unread_count: {
          [receiverId]: 1,
          [senderId]: 0,
        },
        last_message: message.message,
        last_sender: senderId,
        last_sender_name: senderName,
        last_message_at: new Date(),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      room = newRoom;
    }
    if (
      !room?.participants.includes(message.receiverId) &&
      !room?.participants.includes(senderId)
    ) {
      throw new BadRequestException('You are not a participant of this room');
    }

    const newMessage = await this.createMessage({
      room_id: room.id,
      sender_id: senderId,
      sender_name: senderName,
      message: message.message,
      is_read: false,
      created_at: new Date(),
    });

    room.last_message = message.message;
    room.last_sender = senderId;
    room.last_sender_name = senderName;
    room.last_message_at = new Date();

    await this.updateRoom(room);

    this.chatGateway.newMessage(newMessage, room);

    return newMessage;
  }

  async findMessages(query: FindMessageQueryDto): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { roomId, page, limit } = query;
    const pageNumber = page || 1;
    const limitNumber = limit || 20;
    const messages = await this.messageModel
      .find({ room_id: roomId })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ created_at: 1 })
      .populate({
        path: 'room_id',
        model: Room.name,
        select: 'participants unread_count',
      })
      .exec();
    return {
      messages,
      total: messages.length,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(messages.length / limitNumber),
    };
  }

  async findRooms(
    query: PaginationDto,
    req?: AuthRequest,
    userId?: string,
  ): Promise<{
    rooms: Room[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit } = query;
    const pageNumber = page || 1;
    const limitNumber = limit || 20;
    const currentUserId = userId || req?.userId?.toString() || '';

    const rooms = await this.roomModel
      .find({
        participants: { $in: [currentUserId] },
      })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ last_message_at: -1 })
      .exec();
    return {
      rooms,
      total: rooms.length,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(rooms.length / limitNumber),
    };
  }

  async findRoomById(roomId: string): Promise<Room | null> {
    return this.roomModel.findById(roomId);
  }

  async createRoom(room: Partial<Room>): Promise<Room> {
    const newRoom = new this.roomModel(room);
    return newRoom.save();
  }

  async createMessage(message: Partial<Message>): Promise<Message> {
    const newMessage = new this.messageModel(message);
    return newMessage.save();
  }

  async updateRoom(room: Partial<Room>): Promise<Room | null> {
    return this.roomModel.findByIdAndUpdate(room.id, room, { new: true });
  }

  async findRoomByParticipants(
    participants: string[],
    isActive: boolean,
  ): Promise<Room | null> {
    return this.roomModel.findOne({
      participants: { $all: participants },
      is_active: isActive,
    });
  }

  async countRooms(query: {
    participants: string[];
    is_active: boolean;
    last_message_at: { $ne: null };
    last_message: { $regex: string; $options: string };
  }): Promise<number> {
    return this.roomModel.countDocuments(query);
  }

  async readMessages(roomId: string, userId: string): Promise<void> {
    await this.messageModel.updateMany(
      { room_id: roomId, sender_id: userId, is_read: false },
      { is_read: true },
    );
    await this.roomModel.findByIdAndUpdate(roomId, {
      $set: { [`unread_count.${userId}`]: 0 },
    });
  }
}
