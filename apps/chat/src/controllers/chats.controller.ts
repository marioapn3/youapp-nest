import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from '../services/chats.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FindMessageQueryDto,
  PaginationDto,
} from '../dtos/requests/pagination.dto';
import { SendMessageDto } from '../dtos/requests/sendMessage.dto';
import { AuthGuard } from '@app/common';
import { AuthRequest } from '@app/common';

@ApiTags('Chats')
@Controller('')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('viewMessages')
  async findMessages(@Query() query: FindMessageQueryDto) {
    return this.chatService.findMessages(query);
  }

  @Post('sendMessage')
  async sendMessage(@Body() message: SendMessageDto, @Req() req: AuthRequest) {
    return this.chatService.sendMessage(message, req);
  }

  @Get('viewRooms')
  async findRooms(@Query() query: PaginationDto, @Req() req: AuthRequest) {
    return this.chatService.findRooms(query, req);
  }
}
