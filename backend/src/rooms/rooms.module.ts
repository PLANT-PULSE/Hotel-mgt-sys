import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { AddOnsController } from './add-ons.controller';

@Module({
  controllers: [RoomsController, AddOnsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
