import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './product.schema';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async create(product: Product): Promise<Product> {
    return await this.productModel.create(product);
  }

  async deleteAll() {
    await this.productModel.deleteMany({}, {}).exec();
  }

  async findAll(): Promise<(Product & { _id: Types.ObjectId })[]> {
    return this.productModel.find().exec();
  }
}
