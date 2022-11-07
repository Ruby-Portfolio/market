import { PickType } from '@nestjs/swagger';
import { Market } from './market.schema';

export class CreateMarketDto extends PickType(Market, [
  'name',
  'email',
  'phone',
] as const) {
  country: string;
  city: string;
  street: string;
  zipcode: string;
}
