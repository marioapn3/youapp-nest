import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class FindMessageQueryDto {
  @ApiProperty({
    description: 'The ID of the room to get messages from',
    required: true,
    example: '669469469469469469469469',
  })
  @IsString()
  @IsOptional()
  roomId?: string;

  @ApiProperty({
    description: 'The page number to get messages from',
    required: true,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'The limit of messages to get',
    required: true,
    example: 20,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
