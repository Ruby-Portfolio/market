import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../module/auth/auth.guard';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  SearchProductsDto,
  UpdateProductDto,
} from './product.request.dto';
import { SessionUser } from '../../module/auth/auth.decorator';
import { User } from '../user/user.schema';
import { Types } from 'mongoose';
import { ProductResponse, ProductsResponse } from './product.response.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async postProduct(
    @Body() createProduct: CreateProductDto,
    @SessionUser() user: User & { _id: Types.ObjectId },
  ) {
    await this.productService.createProduct(createProduct, user._id);
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

  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:productId')
  async patchProduct(
    @Param('productId') productId: Types.ObjectId,
    @Body() updateProduct: UpdateProductDto,
    @SessionUser() user: User & { _id: Types.ObjectId },
  ) {
    await this.productService.updateProduct(productId, user._id, updateProduct);
  }

  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:productId')
  async deleteProduct(
    @Param('productId') productId: Types.ObjectId,
    @SessionUser() user: User & { _id: Types.ObjectId },
  ) {
    await this.productService.deleteProduct(productId, user._id);
  }
}
