import { Injectable } from '@nestjs/common';

@Injectable()
export class ConceptsTestsService {
  status(): string {
    return 'ok (service)';
  }
}
