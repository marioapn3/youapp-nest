import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../users/users.module';
import { ChatController } from './controllers/chats.controller';
import { ChatService } from './services/chats.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { Room, RoomSchema } from './schemas/room.schema';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './gateways/chat.gateway';
import { Token, TokenSchema } from '../auth/schemas/token.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatEventService } from './services/chat-event.service';
import { ChatEventListener } from './services/chat-event.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    UserModule,
    AuthModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'chat_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChatEventService, ChatEventListener],
  exports: [ChatService, ChatGateway, ChatEventService],
})
export class ChatModule {}
