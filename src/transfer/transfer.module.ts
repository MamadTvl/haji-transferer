import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { BullModule } from '@nestjs/bull';
import { TransferConsumer } from './transfer.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ftp2s3',
      settings: {
        maxStalledCount: 100,
      },
      defaultJobOptions: {
        attempts: 100,
        backoff: {
          type: 'exponential',
          delay: 100,
        },
        removeOnComplete: true,
      },
    }),
  ],
  providers: [TransferService, TransferConsumer],
  exports: [TransferService],
})
export class TransferModule {}
