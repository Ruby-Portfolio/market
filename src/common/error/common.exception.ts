import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidIdException extends HttpException {
  constructor() {
    super('잘못된 id 값입니다.', HttpStatus.BAD_REQUEST);
  }
}
