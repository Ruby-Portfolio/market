import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class ExistsEmailUserException extends HttpException {
  constructor() {
    super('해당 이메일로 가입된 계정이 존재합니다.', HttpStatus.BAD_REQUEST);
  }
}
