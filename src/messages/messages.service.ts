import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
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
    return this.messages;
  }

  findOne(id: string) {
    const message = this.messages.find((item) => item.id === +id);

    if (message) return message;

    throw new NotFoundException('Message not found...');
  }

  create(body: any) {
    this.lastId++;
    const id = this.lastId;
    const newMessage = {
      id,
      ...body,
      date: new Date(),
    };
    this.messages.push(newMessage);

    return newMessage;
  }

  update(id: string, body: any) {
    const existentMessageIndex = this.messages.findIndex(
      (item) => item.id === +id,
    );

    if (existentMessageIndex < 0) {
      throw new NotFoundException('Message not found...');
    }

    const existentMessage = this.messages[existentMessageIndex];

    this.messages[existentMessageIndex] = {
      ...existentMessage,
      ...body,
    };

    return this.messages[existentMessageIndex];
  }

  remove(id: string) {
    const existentMessageIndex = this.messages.findIndex(
      (item) => item.id === +id,
    );

    if (existentMessageIndex < 0) {
      throw new NotFoundException('Message not found...');
    }

    this.messages.splice(existentMessageIndex, 1);
  }
}
