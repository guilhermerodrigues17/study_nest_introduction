import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConceptsTestsModule } from 'src/concepts-tests/concepts-tests.module';

@Module({
  imports: [ConceptsTestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
