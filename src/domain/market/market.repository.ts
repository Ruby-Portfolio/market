import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Market } from './market.schema';

@Injectable()
export class MarketRepository {
  constructor(
    @InjectModel(Market.name) private readonly marketModel: Model<Market>,
  ) {}

  async create(market: Market): Promise<Market & { _id: Types.ObjectId }> {
    return await this.marketModel.create(market);
  }

  async findByMarketIdAndUserId(
    marketId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Market & { _id: Types.ObjectId }> {
    return this.marketModel.findOne({ _id: marketId, user: userId }).exec();
  }

  async deleteAll() {
    await this.marketModel.deleteMany({}, {}).exec();
  }

  async findAll(): Promise<(Market & { _id: Types.ObjectId })[]> {
    return this.marketModel.find().exec();
  }
}
