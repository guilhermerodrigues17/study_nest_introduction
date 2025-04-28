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
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(@Query() pagination: { limit: number; offset: number }) {
    const { limit = 10, offset = 0 } = pagination; //eslint-disable-line
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Patch(':id')
  updateMessage(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    const updatedMessage = this.messagesService.update(id, updateMessageDto);
    return updatedMessage;
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    this.messagesService.remove(id);
    return `REMOVE the message with id ${id}`;
  }
}
