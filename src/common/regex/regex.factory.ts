import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegexProtocol } from './regex.protocol';
import { OnlyLowercaseLettersRegex } from './only-lowercase-letters.regex';
import { RemoveSpacesRegex } from './remove-spaces.regex';

type ClassNames = 'OnlyLowercaseLettersRegex' | 'RemoveSpacesRegex';

@Injectable()
export class RegexFactory {
  create(className: ClassNames): RegexProtocol {
    switch (className) {
      case 'OnlyLowercaseLettersRegex':
        return new OnlyLowercaseLettersRegex();
      case 'RemoveSpacesRegex':
        return new RemoveSpacesRegex();
      default:
        throw new InternalServerErrorException(
          `No class found for ${className}`,
        );
    }
  }
}
