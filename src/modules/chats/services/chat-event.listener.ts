import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class ChatEventListener {
  private readonly logger = new Logger(ChatEventListener.name);

  @EventPattern('chat.message_sent')
  handleMessageSent(@Payload() data: any) {
    this.logger.log(
      `Received chat.message_sent event: ${JSON.stringify(data)}`,
    );
    // handle for notification and antoher event
  }
}
