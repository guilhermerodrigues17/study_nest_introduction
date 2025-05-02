import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  private lastId = 1;

  private messages: Message[] = [
    {
      id: 1,
      content: 'Test content',
      from: 'John',
      to: 'John',
      read: false,
      date: new Date(),
    },
  ];

  findAll() {
    return this.messageRepository.find();
  }

  async findOne(id: number) {
    const message = await this.messageRepository.findOne({
      where: {
        id,
      },
    });

    if (message) return message;

    throw new NotFoundException('Message not found...');
  }

  create(createMessageDto: CreateMessageDto) {
    const newMessage = {
      ...createMessageDto,
      read: false,
      date: new Date(),
    };
    const message: Message = this.messageRepository.create(newMessage);

    return this.messageRepository.save(message);
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    const partialUpdateMessageDto = {
      read: updateMessageDto?.read,
      content: updateMessageDto?.content,
    };

    const existentMessage = await this.messageRepository.preload({
      id,
      ...partialUpdateMessageDto,
    });

    if (!existentMessage) throw new NotFoundException('Message not found...');

    return this.messageRepository.save(existentMessage);
  }

  async remove(id: number) {
    const existentMessage = await this.messageRepository.findOneBy({ id });

    if (!existentMessage) throw new NotFoundException('Message not found...');

    return this.messageRepository.remove(existentMessage);
  }
}
