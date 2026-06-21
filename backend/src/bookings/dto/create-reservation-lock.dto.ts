import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateReservationLockDto {
  @ApiProperty()
  @IsString()
  roomTypeId: string;

  @ApiProperty()
  @IsDateString()
  checkInDate: string;

  @ApiProperty()
  @IsDateString()
  checkOutDate: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}
