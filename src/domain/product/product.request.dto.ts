import { PickType } from '@nestjs/swagger';
import { Product } from './product.schema';
import { IsLocalDate } from '../../common/validation/validation.decorator';
import { ProductErrorMessage } from './product.message';

export class CreateProductDto extends PickType(Product, [
  'name',
  'price',
  'stock',
  'market',
] as const) {
  @IsLocalDate({ message: ProductErrorMessage.INVALID_DEADLINE })
  deadline: string;
}
