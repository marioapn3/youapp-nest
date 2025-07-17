import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'The ID of the room to send the message to',
    required: true,
    example: '669469469469469469469469',
  })
  @IsString()
  @IsOptional()
  roomId: string;

  @ApiProperty({
    description: 'The message to send',
    required: true,
    example: 'Hello, how are you?',
  })
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'The ID of the receiver',
    required: true,
    example: '669469469469469469469469',
  })
  @IsString()
  @IsOptional()
  receiverId: string;
}
