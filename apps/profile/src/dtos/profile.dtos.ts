import {
  IsEnum,
  IsOptional,
  IsString,
  IsDate,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class ProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'marioapn3',
    description: 'The display name of the user',
  })
  display_name: string;

  @ApiProperty({
    example: Gender.MALE,
    description: 'Gender of the user',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    example: '1999-10-10',
    description: 'Birthday of the user',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday: Date;

  @ApiProperty({
    example: 'Aries',
    description: 'Horoscope of the user',
  })
  @IsOptional()
  @IsString()
  horoscope: string;

  @ApiProperty({
    example: 'Libra',
    description: 'Zodiac of the user',
  })
  @IsOptional()
  @IsString()
  zodiac: string;

  @ApiProperty({
    example: 'I am a software engineer',
    description: 'About of the user',
  })
  @IsOptional()
  @IsString()
  about: string;

  @ApiProperty({
    example: '70',
    description: 'Weight of the user',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  weight: number;

  @ApiProperty({
    example: ['music', 'movies'],
    description: 'Interests of the user',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @ApiProperty({
    example: '180',
    description: 'Height of the user',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  height: number;
}
