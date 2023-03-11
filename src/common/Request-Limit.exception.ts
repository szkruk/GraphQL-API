import { HttpException, HttpStatus } from '@nestjs/common';

export class RequestLimitException extends HttpException {
  constructor() {
    super('Request limit reached ', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
