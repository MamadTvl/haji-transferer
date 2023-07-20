import { Injectable } from '@nestjs/common';
import { findFtpPath } from './utils/ftp-finder';
import { getFileBuffer } from './utils/ftp-downloader';
import AWS from 'aws-sdk';
import FTP from 'ftp';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JobData } from './transfer.processor';

@Injectable()
export class TransferService {
  constructor(@InjectQueue('ftp2s3') private queue: Queue<JobData>) {}

  private getS3Instance({ accessKeyId, endpoint, secretAccessKey }) {
    AWS.config.update({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      s3ForcePathStyle: true,
    });
    return new AWS.S3({
      endpoint,
    });
  }

  async uploadToS3(
    file: Buffer,
    config: {
      accessKeyId: string;
      endpoint: string;
      secretAccessKey: string;
      bucketName: string;
    },
    destination: string,
  ) {
    const { accessKeyId, bucketName, endpoint, secretAccessKey } = config;
    const s3 = this.getS3Instance({ accessKeyId, endpoint, secretAccessKey });
    await s3
      .upload({
        Bucket: bucketName,
        Key: destination,
        Body: file,
      })
      .promise();
    return true;
  }

  async getFileBuffer(path: string, config: FTP.Options) {
    return getFileBuffer(path, config);
  }

  private async getAllPathToTransfer(path: string, config: FTP.Options) {
    const pathList = await findFtpPath(path, config);

    return pathList;
  }

  async addTasksToQueue(data: Omit<JobData, 'filePath'>) {
    const { basePath, ftp, s3s } = data;
    const pathList = await this.getAllPathToTransfer(basePath, ftp);
    await this.queue.addBulk(
      pathList.map((filePath) => ({
        data: {
          basePath,
          s3s,
          ftp,
          filePath,
        },
      })),
    );
    return pathList.length;
  }
}
