import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Market, MarketSchema } from './market.schema';
import { MarketService } from './market.service';
import { MarketRepository } from './market.repository';
import { MarketController } from './market.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Market.name, schema: MarketSchema }]),
  ],
  providers: [MarketRepository, MarketService],
  controllers: [MarketController],
  exports: [MarketRepository],
})
export class MarketModule {}
