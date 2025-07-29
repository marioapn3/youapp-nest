import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './controllers/chats.controller';
import { ChatService } from './services/chats.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { Room, RoomSchema } from './schemas/room.schema';
import { WsToken, WsTokenSchema } from './schemas/ws-token.schema';
import { ChatGateway } from './gateways/chat.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatEventService } from './services/chat-event.service';
import { ChatEventListener } from './services/chat-event.listener';
import { WsAuthService } from './services/ws-auth.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from '@app/common/configs/appConfig';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          algorithm: configService.get('jwt.algorithm'),
        },
      }),
      global: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('mongo.uri'),
        dbName: configService.get('mongo.dbName'),
      }),
    }),
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: WsToken.name, schema: WsTokenSchema },
    ]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'auth_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [ChatController, ChatEventListener],
  providers: [
    ChatGateway,
    ChatService,
    ChatEventService,
    WsAuthService,
    WsJwtGuard,
  ],
  exports: [ChatService, ChatGateway, ChatEventService, WsAuthService],
})
export class ChatModule {}
