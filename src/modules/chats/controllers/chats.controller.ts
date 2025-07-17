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
import { FindMessageQueryDto } from '../dtos/requests/pagination.dto';
import { SendMessageDto } from '../dtos/requests/sendMessage.dto';
import { AuthRequest } from 'src/common/interface/auth-request.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

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
