import { Module, Global } from '@nestjs/common';
import { BlobStorageService } from './blob-storage.service';

@Global()
@Module({
  providers: [BlobStorageService],
  exports: [BlobStorageService],
})
export class StorageModule {}
