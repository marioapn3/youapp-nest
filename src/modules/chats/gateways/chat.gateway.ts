import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '../schemas/message.schema';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { WsJwtGuard } from 'src/guards/ws-jwt.guard';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { ChatService } from '../services/chats.service';
import { Room } from '../schemas/room.schema';
import { SendMessageDto } from '../dtos/requests/sendMessage.dto';
import { FindMessageQueryDto } from '../dtos/requests/pagination.dto';
import { ChatEventService } from '../services/chat-event.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedUsers = new Map<string, string>();
  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    private chatEventService: ChatEventService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const token =
        client.handshake.auth?.token || client.handshake.headers.authorization;

      if (!token) {
        client.disconnect();
        console.log(`Client connection rejected (no token): ${client.id}`);
        return;
      }

      const tokenDoc = await this.authService.findTokenWs(
        token as string,
        true,
        new Date(),
      );

      if (!tokenDoc) {
        client.disconnect();
        console.log(`Client connection rejected (invalid token): ${client.id}`);
        return;
      }

      client['userId'] = tokenDoc.userId;
      this.connectedUsers.set(client.id, tokenDoc.userId.toString());

      await client.join(tokenDoc.userId.toString());

      client.emit('connectionSuccess', {
        userId: tokenDoc.userId.toString(),
        socketId: client.id,
        message: 'Successfully connected to chat server',
      });
    } catch (err) {
      console.error('Connection error during token validation:', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.server.emit('userOffline', userId);
    }
    this.connectedUsers.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('startConversation')
  async handleStartConversation(
    client: Socket,
    payload: { receiverId: string },
  ) {
    try {
      const senderId = this.connectedUsers.get(client.id);
      if (!senderId) {
        return { error: 'User not registered' };
      }

      let room = await this.chatService.findRoomByParticipants(
        [senderId, payload.receiverId],
        true,
      );

      if (!room) {
        room = await this.chatService.createRoom({
          participants: [senderId, payload.receiverId],
          unread_count: { [senderId]: 0, [payload.receiverId]: 0 },
          last_message_at: new Date(),
        });
      }

      return { roomId: room.id };
    } catch (error) {
      console.error('Error starting conversation:', error);
      return {
        error: 'Failed to start conversation',
      };
    }
  }

  newMessage(message: Message, room: Room) {
    room.participants.forEach((participantId) => {
      this.server.to(participantId).emit('newMessage', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message,
      });
    });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: SendMessageDto) {
    try {
      const senderId = this.connectedUsers.get(client.id);
      if (!senderId) {
        return { error: 'User not registered' };
      }

      // Validate roomId
      if (!payload.roomId || payload.roomId === 'undefined') {
        return { error: 'Invalid room ID' };
      }

      const room = await this.chatService.findRoomById(payload.roomId);
      if (!room) {
        return { error: 'Conversation not found' };
      }

      if (!room.participants.includes(senderId)) {
        return { error: 'User not part of the conversation' };
      }

      const message = await this.chatService.createMessage({
        room_id: payload.roomId,
        sender_id: senderId,
        message: payload.message,
        is_read: false,
        created_at: new Date(),
      });

      const receiverId = room.participants.find((p) => p !== senderId);
      await this.chatService.updateRoom({
        id: room.id,
        last_message: payload.message,
        last_sender: senderId,
        last_message_at: new Date(),
        unread_count: { [receiverId as string]: 1 },
      });

      // Publish ke RabbitMQ
      await this.chatEventService.publishMessageSent({
        message,
        roomId: payload.roomId,
        senderId,
        receiverId,
      });

      this.newMessage(message, room);

      client.emit('messageSent', {
        message,
        roomId: payload.roomId,
      });

      console.log(
        `Message sent from ${senderId} to ${receiverId} in conversation ${payload.roomId}`,
      );

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        error: 'Failed to send message',
      };
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(client: Socket, payload: FindMessageQueryDto) {
    try {
      const senderId = this.connectedUsers.get(client.id);
      if (!senderId) return { error: 'User not registered' };
      if (!payload.roomId) return { error: 'Room ID is required' };

      const room = await this.chatService.findRoomById(payload.roomId);

      if (!room) return { error: 'Conversation not found' };

      if (!room.participants.includes(senderId)) {
        return { error: 'User not part of the conversation' };
      }

      const messages = await this.chatService.findMessages({
        roomId: payload.roomId,
        page: payload.page,
        limit: payload.limit,
      });

      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        error: 'Failed to fetch messages',
      };
    }
  }

  @SubscribeMessage('getRooms')
  async handleGetRooms(
    client: Socket,
    payload: { page?: number; limit?: number; search?: string },
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) return { error: 'User not registered' };

      const page = payload?.page || 1;
      const limit = payload?.limit || 20;

      const query: any = {
        participants: userId,
        is_active: true,
        last_message_at: { $ne: null },
      };

      if (payload?.search) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        query.lastMessage = { $regex: payload.search, $options: 'i' };
      }

      const totalCount = await this.chatService.countRooms(query);

      const rooms = await this.chatService.findRooms(
        { page, limit },
        undefined,
        userId,
      );

      return {
        conversations: rooms.rooms,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount,
        },
      };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return {
        error: 'Failed to fetch conversations',
      };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, payload: { roomId: string }) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return { error: 'User not registered' };

    await this.chatService.readMessages(payload.roomId, userId);

    const room = await this.chatService.findRoomById(payload.roomId);

    room?.participants?.forEach((participantId) => {
      if (participantId !== userId) {
        this.server.to(participantId).emit('messagesRead', {
          roomId: payload.roomId,
          by: userId,
        });
      }
    });
  }
}
