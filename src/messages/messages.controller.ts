import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';

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

    @Patch(':id')
    updateMessage(@Param('id') id: string, @Body() body: any): Object {
        return {
            id,
            ...body
        };
    }
}
