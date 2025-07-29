import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example: 'secret',
    description: 'Refresh token of the user',
  })
  @IsNotEmpty()
  refreshToken: string;
}
