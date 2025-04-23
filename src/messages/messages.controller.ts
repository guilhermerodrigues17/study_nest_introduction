import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';

@Controller('messages')
export class MessagesController {

    @Get()
    findAll(@Query() pagination: any): string {
        const { limit = 10, offset = 0 } = pagination;
        return `Return all messages. Limit: ${limit}, Offset: ${offset}`;
    }

    @Get(':id')
    findOne(@Param('id') id: string): string {
        return `Return one message with id ${id}`;
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    createMessage(@Body() message: any): string {
        return message;
    }

    @Patch(':id')
    updateMessage(@Param('id') id: string, @Body() body: any): Object {
        return {
            id,
            ...body
        };
    }

    @Delete(':id')
    remove(@Param('id') id: string): string {
        return `REMOVE the message with id ${id}`;
    }
}
