import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

@Controller('messages')
export class MessagesController {

    @Get()
    findAll(): string {
        return 'Return all messages';
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
}
