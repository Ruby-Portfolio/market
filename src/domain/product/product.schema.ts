import { Document, SchemaOptions, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber } from 'class-validator';
import {
  IsCategory,
  IsCountry,
  IsId,
  IsNotBlankString,
} from '../../common/validation/validation.decorator';
import { ProductErrorMessage } from './product.message';
import { MarketErrorMessage } from '../market/market.message';
import { Category } from '../common/enums/Category';
import { Country } from '../common/enums/Country';
import { CommonErrorMessage } from '../../common/error/common.message';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Product extends Document {
  @IsNotBlankString({ message: ProductErrorMessage.EMPTY_NAME })
  @Prop({ required: true })
  name: string;

  @IsNumber({}, { message: ProductErrorMessage.INVALID_PRICE })
  @Prop({ required: true })
  price: number;

  @IsNumber({}, { message: ProductErrorMessage.INVALID_STOCK })
  @Prop({ required: true })
  stock: number;

  @IsCategory({ message: CommonErrorMessage.INVALID_CATEGORY })
  @Prop({ required: true })
  category: Category;

  @IsCountry({ message: CommonErrorMessage.INVALID_COUNTRY })
  @Prop({ required: true })
  country: Country;

  @Prop({ required: true })
  deadline: Date;

  @IsId({ message: MarketErrorMessage.INVALID_MARKET_ID })
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Market', required: true })
  market: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
