import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PromoCodesController } from './promo-codes.controller';
import { AdminBookingsController } from './admin-bookings.controller';

@Module({
  controllers: [BookingsController, PromoCodesController, AdminBookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
