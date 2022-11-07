import { Injectable } from '@nestjs/common';
import { MarketRepository } from './market.repository';
import { CreateMarketDto } from './market.request.dto';
import { Market } from './market.schema';
import { Address } from '../embeddeds/address';
import { Types } from 'mongoose';

@Injectable()
export class MarketService {
  constructor(private readonly marketRepository: MarketRepository) {}

  async createMarket(
    { name, email, phone, country, city, street, zipcode }: CreateMarketDto,
    _id: Types.ObjectId,
  ) {
    const address: Address = { country, city, street, zipcode };

    return this.marketRepository.create({
      name,
      email,
      phone,
      address,
      user: _id,
    } as Market);
  }
}
