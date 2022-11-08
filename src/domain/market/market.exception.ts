import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import { MarketErrorMessage } from './market.message';

export class NotFoundMarketException extends HttpException {
  constructor() {
    super(MarketErrorMessage.NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}
