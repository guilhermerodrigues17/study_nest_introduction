import { Controller, Get, Param } from '@nestjs/common';

@Controller('messages')
export class MessagesController {

    @Get()
    findAll(): string {
        return 'Return all messages';
    }

    @Get(':id')
    findOne(@Param() id: number): string {
        return 'Return one message';
    }
}
