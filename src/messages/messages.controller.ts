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
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';

// @UseInterceptors(AuthTokenInterceptor)
@UseGuards(IsAdminGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const message = await this.messagesService.findAll(paginationDto);
    return message;
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.messagesService.findOne(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Patch(':id')
  updateMessage(
    @Param('id') id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    const updatedMessage = this.messagesService.update(id, updateMessageDto);
    return updatedMessage;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.messagesService.remove(id);
  }
}
