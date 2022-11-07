import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthLocalGuard } from '../../module/auth/auth.guard';
import { MarketService } from './market.service';
import { CreateMarketDto } from './market.request.dto';
import { SessionUser } from '../../module/auth/auth.decorator';
import { User } from '../user/user.schema';

@Controller('markets')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @UseGuards(AuthLocalGuard)
  @Post()
  async postMarket(
    @Body() createMarket: CreateMarketDto,
    @SessionUser() user: User,
    @Res() res,
  ) {
    await this.marketService.createMarket(createMarket, user.id);
    res.status(HttpStatus.CREATED).send();
  }
}
