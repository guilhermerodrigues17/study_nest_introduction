import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { UserModule } from 'src/user/user.module';
import {
  ONLY_LOWERCASE_LETTERS_REGEX,
  REMOVE_SPACES_REGEX,
  SERVER_TEST,
} from './messages.constant';
import { RegexFactory } from 'src/common/regex/regex.factory';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UserModule],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    RegexFactory,
    {
      provide: SERVER_TEST,
      useValue: 'Server Test: NestJS',
    },
    {
      provide: ONLY_LOWERCASE_LETTERS_REGEX,
      useFactory: (regexFactory: RegexFactory) => {
        return regexFactory.create('OnlyLowercaseLettersRegex');
      },
      inject: [RegexFactory],
    },
    {
      provide: REMOVE_SPACES_REGEX,
      useFactory: (regexFactory: RegexFactory) => {
        return regexFactory.create('RemoveSpacesRegex');
      },
      inject: [RegexFactory],
    },
  ],
})
export class MessagesModule {}
