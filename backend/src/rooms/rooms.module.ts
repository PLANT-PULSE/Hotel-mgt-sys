import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { AddOnsController } from './add-ons.controller';
import { BlobStorageService } from '../storage/blob-storage.service';

@Module({
  controllers: [RoomsController, AddOnsController],
  providers: [RoomsService, BlobStorageService],
  exports: [RoomsService],
})
export class RoomsModule {}
