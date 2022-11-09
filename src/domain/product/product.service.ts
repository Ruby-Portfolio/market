import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { Product } from './product.schema';
import { Types } from 'mongoose';
import {
  CreateProductDto,
  SearchProductsDto,
  UpdateProductDto,
} from './product.request.dto';
import { MarketRepository } from '../market/market.repository';
import { NotFoundMarketException } from '../market/market.exception';
import { NotFoundProductException } from './product.exception';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly marketRepository: MarketRepository,
  ) {}

  async createProduct(
    createProduct: CreateProductDto,
    userId: Types.ObjectId,
  ): Promise<Product & { _id: Types.ObjectId }> {
    const existsMarket = await this.marketRepository.findByMarketIdAndUserId(
      createProduct.marketId,
      userId,
    );

    if (!existsMarket) {
      throw new NotFoundMarketException();
    }

    const product = {
      ...createProduct,
      deadline: new Date(createProduct.deadline),
      country: existsMarket.country,
      marketId: existsMarket._id,
      userId: userId,
    } as Product;

    return this.productRepository.create(product);
  }

  async getProducts(
    searchProduct: SearchProductsDto,
  ): Promise<(Product & { _id: Types.ObjectId })[]> {
    return this.productRepository.findBySearch(searchProduct);
  }

  async getProduct(
    productId: Types.ObjectId,
  ): Promise<Product & { _id: Types.ObjectId }> {
    return this.productRepository.findDetailInfoById(productId);
  }

  async updateProduct(
    productId: Types.ObjectId,
    userId: Types.ObjectId,
    updateProduct: UpdateProductDto,
  ) {
    const product = {
      ...updateProduct,
      deadline: new Date(updateProduct.deadline),
    } as Product;

    const updatedProduct = await this.productRepository.update(
      productId,
      userId,
      product,
    );

    if (!updatedProduct) {
      throw new NotFoundProductException();
    }

    return updatedProduct;
  }

  async deleteProduct(
    productId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const deletedProduct = await this.productRepository.softDelete(
      productId,
      userId,
    );

    if (!deletedProduct) {
      throw new NotFoundProductException();
    }
  }
}
