import { Controller, Get } from '@nestjs/common';
import { ConceptsTestsService } from './concepts-tests.service';

@Controller('concepts-tests')
export class ConceptsTestsController {
  constructor(private readonly conceptsTestsService: ConceptsTestsService) {}

  @Get('status')
  status(): string {
    return this.conceptsTestsService.status();
  }
}
