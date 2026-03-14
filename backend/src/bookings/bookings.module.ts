import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ReservationLockService } from './reservation-lock.service';
import { PromoCodesController } from './promo-codes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [BookingsController, PromoCodesController],
  providers: [BookingsService, ReservationLockService],
  exports: [BookingsService, ReservationLockService],
})
export class BookingsModule {}
