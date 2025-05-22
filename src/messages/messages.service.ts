import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
  ) {}

  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto as PaginationDto;

    return this.messageRepository.find({
      take: limit,
      skip: offset,
      relations: ['from', 'to'],
      order: {
        id: 'desc',
      },
      select: {
        from: {
          id: true,
          name: true,
        },
        to: {
          id: true,
          name: true,
        },
      },
    });
  }

  async findOne(id: number) {
    const message = await this.messageRepository.findOne({
      where: {
        id,
      },
      relations: ['from', 'to'],
      select: {
        from: {
          id: true,
          name: true,
        },
        to: {
          id: true,
          name: true,
        },
      },
    });

    if (message) return message;

    throw new NotFoundException('Message not found...');
  }

  async create(
    createMessageDto: CreateMessageDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const { toId } = createMessageDto;

    const from = await this.userService.findOne(tokenPayload.sub);
    const to = await this.userService.findOne(toId);

    const newMessage = {
      content: createMessageDto.content,
      from,
      to,
      read: false,
      date: new Date(),
    };

    const message = this.messageRepository.create(newMessage);
    await this.messageRepository.save(message);

    return {
      ...message,
      from: {
        id: message.from.id,
        name: message.from.name,
      },
      to: {
        id: message.to.id,
        name: message.to.name,
      },
    };
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const message = await this.findOne(id);

    if (message.from.id !== tokenPayload.sub) {
      throw new ForbiddenException('You can only update your own messages...');
    }

    message.content = updateMessageDto?.content ?? message.content;
    message.read = updateMessageDto?.read ?? message.read;

    return this.messageRepository.save(message);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const existentMessage = await this.findOne(id);

    if (!existentMessage) throw new NotFoundException('Message not found...');

    if (existentMessage.from.id !== tokenPayload.sub) {
      throw new ForbiddenException('You can only remove your own messages...');
    }

    await this.messageRepository.remove(existentMessage);
  }
}
