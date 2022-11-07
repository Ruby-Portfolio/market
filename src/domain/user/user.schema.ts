import { Document, SchemaOptions } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { AuthErrorMessage } from '../../module/auth/auth.message';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class User extends Document {
  @IsEmail({}, { message: AuthErrorMessage.INVALID_EMAIL })
  @IsNotEmpty()
  @Prop({ required: true })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  password: string;

  @IsString()
  @MinLength(2, { message: AuthErrorMessage.NAME_MIN_LENGTH })
  @Prop({ required: true })
  name: string;

  @IsMobilePhone('ko-KR', {}, { message: AuthErrorMessage.INVALID_PHONE })
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
