import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString, Min } from 'class-validator';

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

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

