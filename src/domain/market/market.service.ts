import { Injectable } from '@nestjs/common';
import { MarketRepository } from './market.repository';
import { CreateMarketDto } from './market.request.dto';
import { Market } from './market.schema';
import { Types } from 'mongoose';

@Injectable()
export class MarketService {
  constructor(private readonly marketRepository: MarketRepository) {}

  async createMarket(
    { name, email, phone, country }: CreateMarketDto,
    userId: Types.ObjectId,
  ): Promise<Market & { _id: Types.ObjectId }> {
    return this.marketRepository.create({
      name,
      email,
      phone,
      country,
      userId: userId,
    } as Market);
  }
}
