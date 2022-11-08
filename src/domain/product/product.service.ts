import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { Product } from './product.schema';
import { Types } from 'mongoose';
import { CreateProductDto, SearchProductsDto } from './product.request.dto';
import { MarketRepository } from '../market/market.repository';
import { NotFoundMarketException } from '../market/market.exception';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly marketRepository: MarketRepository,
  ) {}

  async createProduct(
    { name, price, stock, category, deadline, market }: CreateProductDto,
    userId: Types.ObjectId,
  ): Promise<Product & { _id: Types.ObjectId }> {
    const existsMarket = await this.marketRepository.findByMarketIdAndUserId(
      market,
      userId,
    );

    if (!existsMarket) {
      throw new NotFoundMarketException();
    }

    return this.productRepository.create({
      name,
      price,
      stock,
      category,
      country: existsMarket.country,
      deadline: new Date(deadline),
      market,
    } as Product);
  }

  async getProducts(
    searchProduct: SearchProductsDto,
  ): Promise<(Product & { _id: Types.ObjectId })[]> {
    return this.productRepository.findBySearch(searchProduct);
  }

  async getProduct(
    productId: Types.ObjectId,
  ): Promise<Product & { _id: Types.ObjectId }> {
    return this.productRepository.findById(productId);
  }
}
