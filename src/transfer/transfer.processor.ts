import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TransferService } from './transfer.service';

export interface JobData {
  ftp: {
    user: string;
    password: string;
    host: string;
  };
  s3s: {
    accessKeyId: string;
    endpoint: string;
    secretAccessKey: string;
    bucketName: string;
  }[];
  filePath: string;
  basePath: string;
}

@Processor({ name: 'ftp2s3' })
export class TransferConsumer {
  constructor(private transferService: TransferService) {}

  @Process({ concurrency: 20 })
  async transfer(job: Job<JobData>) {
    const { basePath, filePath, ftp, s3s } = job.data;
    const buffer = await this.transferService.getFileBuffer(filePath, ftp);
    await Promise.all(
      s3s.map((s3) => {
        this.transferService.uploadToS3(
          buffer,
          s3,
          filePath.replace(basePath, ''),
        );
      }),
    );
    return {};
  }
}
