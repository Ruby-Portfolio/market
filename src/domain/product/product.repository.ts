import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './product.schema';
import { SearchProductsDto } from './product.request.dto';
import { Paging } from '../common/enums/paging';
import { ProductOrder } from './product.enum';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  private readonly PAGE_SIZE = 10;

  async create(product: Product): Promise<Product & { _id: Types.ObjectId }> {
    return this.productModel.create(product);
  }

  async findDetailInfoById(
    productId: Types.ObjectId,
  ): Promise<Product & { _id: Types.ObjectId }> {
    return this.productModel.findById(productId).populate('marketId');
  }

  async findBySearch({
    country,
    category,
    order = ProductOrder.NEW,
    keyword,
    page = 1,
  }: SearchProductsDto): Promise<(Product & { _id: Types.ObjectId })[]> {
    const skip = (page - 1) * this.PAGE_SIZE;

    const query = this.productModel.find();

    if (country) {
      query.where('country').equals(country);
    }
    if (category) {
      query.where('category').equals(category);
    }
    if (keyword) {
      const fragmentWords = keyword.trim().split(' ');
      query.where('name').regex(fragmentWords.join('|'));
    }

    query.skip(skip).limit(this.PAGE_SIZE);

    if (order === ProductOrder.DEADLINE) {
      query.sort({ deadline: Paging.ASC });
    }

    return query;
  }

  async update(
    productId: Types.ObjectId,
    userId: Types.ObjectId,
    product: Product,
  ): Promise<Product & { _id: Types.ObjectId }> {
    return this.productModel.findOneAndUpdate(
      { _id: productId, userId },
      product,
    );
  }

  async softDelete(
    productId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Product & { _id: Types.ObjectId }> {
    return this.productModel.findOneAndUpdate(
      { _id: productId, userId },
      { deleteAt: new Date() },
    );
  }

  async deleteAll() {
    await this.productModel.deleteMany({}, {});
  }

  async findAll(): Promise<(Product & { _id: Types.ObjectId })[]> {
    return this.productModel.find();
  }
}
