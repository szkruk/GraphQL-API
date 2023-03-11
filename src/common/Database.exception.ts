import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseException extends HttpException {
  constructor() {
    super('There is problem with database', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
