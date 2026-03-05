import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomTypeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'suite' })
  @IsString()
  type: string;

  @ApiProperty({ example: 299 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ example: '65m²' })
  @IsString()
  size: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  maxGuests: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  beds: number;

  @ApiProperty({ example: ['wifi', 'pool', 'spa'] })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalUnits?: number;
}
