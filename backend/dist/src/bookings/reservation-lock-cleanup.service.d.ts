import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ReservationLockService } from './reservation-lock.service';
export declare class ReservationLockCleanupService implements OnModuleInit, OnModuleDestroy {
    private locks;
    private interval;
    constructor(locks: ReservationLockService);
    onModuleInit(): void;
    onModuleDestroy(): void;
}
