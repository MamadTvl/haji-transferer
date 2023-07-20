import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransferModule } from './transfer/transfer.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        db: +process.env.REDIS_DB,
        password: process.env.REDIS_PASSWORD,
      },
      prefix: 'haji_transfer',
    }),
    TransferModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
