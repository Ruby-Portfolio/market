import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../module/auth/auth.guard';
import { MarketService } from './market.service';
import { CreateMarketDto } from './market.request.dto';
import { SessionUser } from '../../module/auth/auth.decorator';
import { User } from '../user/user.schema';
import { Types } from 'mongoose';

@Controller('markets')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async postMarket(
    @Body() createMarket: CreateMarketDto,
    @SessionUser() user: User & { _id: Types.ObjectId },
  ): Promise<void> {
    await this.marketService.createMarket(createMarket, user._id);
  }
}
