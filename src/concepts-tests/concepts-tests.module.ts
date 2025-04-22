import { Module } from '@nestjs/common';
import { ConceptsTestsController } from './concepts-tests.controller';
import { ConceptsTestsService } from './concepts-tests.service';

@Module({
  controllers: [ConceptsTestsController],
  providers: [ConceptsTestsService]
})
export class ConceptsTestsModule { }
