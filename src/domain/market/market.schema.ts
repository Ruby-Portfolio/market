import { Document, SchemaOptions, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsMobilePhone } from 'class-validator';
import { MarketErrorMessage } from './market.message';
import { CommonErrorMessage } from '../../common/error/common.message';
import {
  IsCountry,
  IsNotBlankString,
} from '../../common/validation/validation.decorator';
import { Country } from '../common/enums/Country';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Market extends Document {
  @IsNotBlankString({ message: MarketErrorMessage.EMPTY_NAME })
  @Prop({ required: true })
  name: string;

  @IsEmail({}, { message: CommonErrorMessage.INVALID_EMAIL })
  @Prop({ required: true })
  email: string;

  @IsMobilePhone('ko-KR', {}, { message: CommonErrorMessage.INVALID_PHONE })
  @Prop({ required: true })
  phone: string;

  @IsCountry({ message: CommonErrorMessage.INVALID_COUNTRY })
  @Prop()
  country: Country;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const MarketSchema = SchemaFactory.createForClass(Market);
MarketSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'market',
});
