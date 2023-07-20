import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AddTaskDto } from './dto/app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('ftp-to-s3')
  async getHello(@Body() body: AddTaskDto) {
    const length = await this.appService.addTask(body);
    return {
      message: `number of tasks: ${length}`,
    };
  }
}
