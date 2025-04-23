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

@Controller('messages')
export class MessagesController {
  @Get()
  findAll(@Query() pagination: { limit: number; offset: number }): string {
    const { limit = 10, offset = 0 } = pagination;
    return `Return all messages. Limit: ${limit}, Offset: ${offset}`;
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `Return one message with id ${id}`;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  createMessage(@Body() message: string): string {
    return message;
  }

  @Patch(':id')
  updateMessage(
    @Param('id') id: string,
    @Body() body: { message: string },
  ): object {
    return {
      id,
      ...body,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return `REMOVE the message with id ${id}`;
  }
}
