import { Document, SchemaOptions, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Market extends Document {
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Prop({ required: true })
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @Prop({ required: true })
  phone: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const MarketSchema = SchemaFactory.createForClass(Market);
MarketSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'market',
});
