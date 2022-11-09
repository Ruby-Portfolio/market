import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import { ProductErrorMessage } from './product.message';

export class NotFoundProductException extends HttpException {
  constructor() {
    super(ProductErrorMessage.NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}
