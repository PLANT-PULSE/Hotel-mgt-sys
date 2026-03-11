import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { AddOnsController } from './add-ons.controller';
import { RoomsImagesController } from './rooms-images.controller';
import { BlobService } from '../storage/blob.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebSocketModule],
  controllers: [RoomsController, AddOnsController, RoomsImagesController],
  providers: [RoomsService, BlobService],
  exports: [RoomsService, BlobService],
})
export class RoomsModule {}
