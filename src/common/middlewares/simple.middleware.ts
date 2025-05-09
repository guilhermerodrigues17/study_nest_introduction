import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class SimpleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader('middleware-header', 'value from middleware');
    console.log('SimpleMiddleware exec');

    return next();
  }
}
