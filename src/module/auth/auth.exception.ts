import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import { AuthErrorMessage } from './auth.message';

export class ExistsEmailUserException extends HttpException {
  constructor() {
    super(AuthErrorMessage.EXISTS_EMAIL_USER, HttpStatus.BAD_REQUEST);
  }
}

export class InvalidUserInfoException extends HttpException {
  constructor() {
    super(AuthErrorMessage.INVALID_USER, HttpStatus.BAD_REQUEST);
  }
}
