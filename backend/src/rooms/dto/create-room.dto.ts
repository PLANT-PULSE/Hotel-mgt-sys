import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  @IsUUID()
  roomTypeId: string;

  @ApiProperty({ example: '101' })
  @IsString()
  number: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  floor: number;
}
