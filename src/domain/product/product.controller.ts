import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../module/auth/auth.guard';
import { ProductService } from './product.service';
import { CreateProductDto, SearchProductsDto } from './product.request.dto';
import { SessionUser } from '../../module/auth/auth.decorator';
import { User } from '../user/user.schema';
import { Types } from 'mongoose';
import { ProductResponse, ProductsResponse } from './product.response.dto';

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

  @Get()
  async getProducts(
    @Query() searchProducts: SearchProductsDto,
  ): Promise<ProductsResponse> {
    const products = await this.productService.getProducts(searchProducts);
    return new ProductsResponse(products);
  }

  @Get('/:productId')
  async getProduct(
    @Param('productId') productId: Types.ObjectId,
  ): Promise<ProductResponse> {
    const product = await this.productService.getProduct(productId);
    return new ProductResponse(product);
  }
}
