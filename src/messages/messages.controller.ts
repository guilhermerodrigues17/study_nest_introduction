import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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
import { RegexProtocol } from 'src/common/regex/regex.protocol';
import {
  ONLY_LOWERCASE_LETTERS_REGEX,
  REMOVE_SPACES_REGEX,
  SERVER_TEST,
} from './messages.constant';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    @Inject(ONLY_LOWERCASE_LETTERS_REGEX)
    private readonly onlyLowercaseLetters: RegexProtocol,
    @Inject(REMOVE_SPACES_REGEX)
    private readonly removeSpaces: RegexProtocol,
    @Inject(SERVER_TEST)
    private readonly serverTestString: string,
  ) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const message = await this.messagesService.findAll(paginationDto);
    return message;
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.messagesService.findOne(id);
  }

  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @TokenPayloadParam() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.messagesService.create(createMessageDto, tokenPayloadDto);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  updateMessage(
    @Param('id') id: number,
    @Body() updateMessageDto: UpdateMessageDto,
    @TokenPayloadParam() tokenPayloadDto: TokenPayloadDto,
  ) {
    const updatedMessage = this.messagesService.update(
      id,
      updateMessageDto,
      tokenPayloadDto,
    );
    return updatedMessage;
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayloadDto: TokenPayloadDto,
  ) {
    await this.messagesService.remove(id, tokenPayloadDto);
  }
}
