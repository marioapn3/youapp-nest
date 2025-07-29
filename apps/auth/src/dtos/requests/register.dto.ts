import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    example: 'mario.aprilnino27@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password of the user',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  password: string;

  @ApiProperty({
    example: 'marioapn3',
    description: 'Username of the user',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password confirmation of the user',
  })
  @IsNotEmpty()
  password_confirmation: string;
}
