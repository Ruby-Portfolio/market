import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../module/auth/auth.guard';
import { ProductService } from './product.service';
import { CreateProductDto } from './product.request.dto';
import { SessionUser } from '../../module/auth/auth.decorator';
import { User } from '../user/user.schema';
import { Types } from 'mongoose';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthenticatedGuard)
  @Post()
  async postProduct(
    @Body() createProduct: CreateProductDto,
    @SessionUser() user: User & { _id: Types.ObjectId },
    @Res() res,
  ) {
    await this.productService.createProduct(createProduct, user._id);
    res.status(HttpStatus.CREATED).send();
  }
}
