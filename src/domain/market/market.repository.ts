import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Market } from './market.schema';

@Injectable()
export class MarketRepository {
  constructor(
    @InjectModel(Market.name) private readonly marketModel: Model<Market>,
  ) {}

  async create(market: Market): Promise<Market> {
    return await this.marketModel.create(market);
  }
}
