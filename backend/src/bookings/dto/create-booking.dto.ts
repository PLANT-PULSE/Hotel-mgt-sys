import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BookingItemDto {
  @ApiProperty()
  @IsString()
  roomTypeId: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  pricePerNight: number;
}

export class CreateBookingDto {
  @ApiProperty()
  @IsDateString()
  checkInDate: string;

  @ApiProperty()
  @IsDateString()
  checkOutDate: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  guestFirstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  guestLastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  guestEmail: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({ type: [BookingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items: BookingItemDto[];

  @ApiPropertyOptional({ example: [{ addOnId: 'uuid', quantity: 1 }] })
  @IsOptional()
  @IsArray()
  addOns?: { addOnId: string; quantity: number }[];
}
