import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ReservationLockService } from './reservation-lock.service';

@Injectable()
export class ReservationLockCleanupService implements OnModuleInit, OnModuleDestroy {
  private interval: NodeJS.Timeout | null = null;

  constructor(private locks: ReservationLockService) {}

  onModuleInit() {
    // Keep it simple and dependency-free (no scheduler package).
    this.interval = setInterval(() => {
      void this.locks.cleanupExpiredLocks();
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }
}

