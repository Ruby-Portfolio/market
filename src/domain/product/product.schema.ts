import { Document, SchemaOptions, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Product extends Document {
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Prop({ required: true })
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Prop({ required: true })
  stock: number;

  @IsDate()
  @IsNotEmpty()
  @Prop({ required: true })
  deadline: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Market', required: true })
  market: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
