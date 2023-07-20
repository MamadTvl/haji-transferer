import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsString, ValidateNested } from 'class-validator';

class FtpConfig {
  @IsString()
  user: string;
  @IsString()
  password: string;
  @IsString()
  host: string;
}

class S3Config {
  @IsString()
  accessKeyId: string;
  @IsString()
  endpoint: string;
  @IsString()
  secretAccessKey: string;
  @IsString()
  bucketName: string;
}

export class AddTaskDto {
  @IsString()
  basePath: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => FtpConfig)
  ftp: FtpConfig;

  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => S3Config)
  s3s: S3Config[];
}
