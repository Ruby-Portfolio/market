import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MarketRepository } from '../market/market.repository';
import { Market, MarketSchema } from '../market/market.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Market.name, schema: MarketSchema },
    ]),
  ],
  providers: [ProductRepository, ProductService, MarketRepository],
  controllers: [ProductController],
})
export class ProductModule {}
