import { PickType } from '@nestjs/swagger';
import { Product } from './product.schema';
import {
  IsCategory,
  IsCountry,
  IsLocalDate,
  IsPage,
} from '../../common/validation/validation.decorator';
import { ProductErrorMessage } from './product.message';
import { Country } from '../common/enums/Country';
import { Category } from '../common/enums/Category';
import { CommonErrorMessage } from '../../common/error/common.message';
import { IsOptional, IsString } from 'class-validator';

export class CreateProductDto extends PickType(Product, [
  'name',
  'price',
  'stock',
  'category',
  'marketId',
] as const) {
  @IsLocalDate({ message: ProductErrorMessage.INVALID_DEADLINE })
  deadline: string;
}

export class SearchProductsDto {
  @IsCountry({ message: CommonErrorMessage.INVALID_COUNTRY, nullable: true })
  country?: Country;
  @IsCategory({ message: CommonErrorMessage.INVALID_CATEGORY, nullable: true })
  category?: Category;
  @IsPage({ message: CommonErrorMessage.INVALID_PAGE, nullable: true })
  page?: number = 1;
  @IsOptional()
  @IsString({ message: CommonErrorMessage.INVALID_KEYWORD })
  keyword?: string;
}

export class UpdateProductDto extends PickType(Product, [
  'name',
  'price',
  'stock',
  'category',
] as const) {
  @IsLocalDate({ message: ProductErrorMessage.INVALID_DEADLINE })
  deadline: string;
}
