import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { WsAuthService } from './ws-auth.service';

@Controller()
export class ChatEventListener {
  private readonly logger = new Logger(ChatEventListener.name);

  constructor(private wsAuthService: WsAuthService) {}

  @EventPattern('chat.message_sent')
  handleMessageSent(@Payload() data: any) {
    this.logger.log(
      `Received chat.message_sent event: ${JSON.stringify(data)}`,
    );
    // handle for notification and another event
  }

  @EventPattern('auth.user_login')
  async handleUserLogin(
    @Payload()
    data: {
      userId: string;
      username: string;
      email: string;
      timestamp: Date;
      access_token: string;
    },
  ) {
    try {
      this.logger.log(
        `Received auth.user_login event for user: ${data.userId}`,
      );
      this.logger.log(`Event data: ${JSON.stringify(data)}`);

      // Create WebSocket token for the user
      const wsToken = await this.wsAuthService.createWsToken({
        userId: data.userId,
        username: data.username,
        email: data.email,
      });

      this.logger.log(
        `Successfully created WebSocket token for user ${data.userId}: ${wsToken}`,
      );
    } catch (error) {
      this.logger.error('Error handling user login event:', error);
      this.logger.error('Error stack:', error.stack);
    }
  }
}
