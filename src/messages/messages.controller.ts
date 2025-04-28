import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(@Query() pagination: { limit: number; offset: number }) {
    const { limit = 10, offset = 0 } = pagination;
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  createMessage(@Body() message: any) {
    return this.messagesService.create(message);
  }

  @Patch(':id')
  updateMessage(@Param('id') id: string, @Body() body: { message: string }) {
    const updatedMessage = this.messagesService.update(id, body);
    return updatedMessage;
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    this.messagesService.remove(id);
    return `REMOVE the message with id ${id}`;
  }
}
