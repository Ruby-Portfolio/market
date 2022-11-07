import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class Address {
  @IsString()
  @IsNotEmpty()
  @Prop()
  country: string;

  @IsString()
  @IsNotEmpty()
  @Prop()
  city: string;

  @IsString()
  @IsNotEmpty()
  @Prop()
  street: string;

  @IsString()
  @IsNotEmpty()
  @Prop()
  zipcode: string;
}
