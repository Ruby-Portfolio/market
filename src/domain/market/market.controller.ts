import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
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
  @Post()
  async postMarket(
    @Body() createMarket: CreateMarketDto,
    @SessionUser() user: User & { _id: Types.ObjectId },
    @Res() res,
  ) {
    await this.marketService.createMarket(createMarket, user._id);
    res.status(HttpStatus.CREATED).send();
  }
}
