import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param' || metadata.data !== 'id') {
      return value;
    }

    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      throw new BadRequestException(
        'ParseIntIdPipe expects a numeric string value',
      );
    }

    if (parsedValue < 0) {
      throw new BadRequestException('Id number must be greater than zero');
    }

    return parsedValue;
  }
}
