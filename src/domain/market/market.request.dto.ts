import { PickType } from '@nestjs/swagger';
import { Market } from './market.schema';

export class CreateMarketDto extends PickType(Market, [
  'name',
  'email',
  'phone',
  'country',
] as const) {}
