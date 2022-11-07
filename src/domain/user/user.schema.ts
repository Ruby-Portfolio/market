import { Document, SchemaOptions } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsMobilePhone, IsString, MinLength } from 'class-validator';
import { AuthErrorMessage } from '../../module/auth/auth.message';
import { CommonErrorMessage } from '../../common/error/common.message';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class User extends Document {
  @IsEmail({}, { message: CommonErrorMessage.INVALID_EMAIL })
  @Prop({ required: true })
  email: string;

  @IsString()
  @Prop({ required: true })
  password: string;

  @IsString()
  @MinLength(2, { message: AuthErrorMessage.MIN_LENGTH_NAME })
  @Prop({ required: true })
  name: string;

  @IsMobilePhone('ko-KR', {}, { message: CommonErrorMessage.INVALID_PHONE })
  @Prop({ required: true })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.virtual('markets', {
  ref: 'Market',
  localField: '_id',
  foreignField: 'user',
});
