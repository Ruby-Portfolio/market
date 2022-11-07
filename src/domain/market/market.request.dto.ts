import { PickType } from '@nestjs/swagger';
import { Market } from './market.schema';
import { IsNotEmpty, IsString } from 'class-validator';
import { MarketErrorMessage } from './market.message';

export class CreateMarketDto extends PickType(Market, [
  'name',
  'email',
  'phone',
] as const) {
  @IsString()
  @IsNotEmpty({ message: MarketErrorMessage.EMPTY_COUNTRY })
  country: string;

  @IsString()
  @IsNotEmpty({ message: MarketErrorMessage.EMPTY_CITY })
  city: string;

  @IsString()
  @IsNotEmpty({ message: MarketErrorMessage.EMPTY_STREET })
  street: string;

  @IsString()
  @IsNotEmpty({ message: MarketErrorMessage.EMPTY_ZIPCODE })
  zipcode: string;
}
