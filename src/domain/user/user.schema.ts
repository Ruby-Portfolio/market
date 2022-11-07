import { Document, SchemaOptions } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class User extends Document {
  @IsEmail()
  @IsNotEmpty()
  @Prop({ required: true })
  email: string;

  @IsNotEmpty()
  @Prop({ required: true })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  name: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @Prop({ required: true })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.virtual('markets', {
  ref: 'Market',
  localField: '_id',
  foreignField: 'user',
});
