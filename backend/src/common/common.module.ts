import { Global, Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';
import { ActivityLogService } from './services/activity-log.service';

@Global()
@Module({
  providers: [PasswordService, ActivityLogService],
  exports: [PasswordService, ActivityLogService],
})
export class CommonModule {}
