import { PickType } from '@nestjs/swagger';
import { Product } from './product.schema';

export class CreateProductDto extends PickType(Product, [
  'name',
  'price',
  'stock',
  'deadline',
  'market',
] as const) {}
