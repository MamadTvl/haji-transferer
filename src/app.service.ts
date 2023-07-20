import { AddTaskDto } from './dto/app.dto';
import { TransferService } from './transfer/transfer.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private transferService: TransferService) {}

  addTask(data: AddTaskDto) {
    return this.transferService.addTasksToQueue(data);
  }
}
