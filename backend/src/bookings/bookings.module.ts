import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PromoCodesController } from './promo-codes.controller';

@Module({
  controllers: [BookingsController, PromoCodesController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
