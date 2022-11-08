import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MarketRepository } from '../../../../domain/market/market.repository';
import { ProductService } from '../../../../domain/product/product.service';
import { Market } from '../../../../domain/market/market.schema';
import { NotFoundMarketException } from '../../../../domain/market/market.exception';
import { CreateProductDto } from '../../../../domain/product/product.request.dto';
import { ProductRepository } from '../../../../domain/product/product.repository';
import { Product } from '../../../../domain/product/product.schema';
import { Types } from 'mongoose';

describe('ProductService', () => {
  let marketRepository: MarketRepository;
  let productRepository: ProductRepository;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketRepository,
        ProductRepository,
        ProductService,
        {
          provide: getModelToken(Market.name),
          useFactory: () => {},
        },
        {
          provide: getModelToken(Product.name),
          useFactory: () => {},
        },
      ],
    }).compile();

    marketRepository = await module.get<MarketRepository>(MarketRepository);
    productRepository = await module.get<ProductRepository>(ProductRepository);
    productService = await module.get<ProductService>(ProductService);
  });

  describe('createProduct - 상품 등록', () => {
    test('마켓 Id와 유저 Id에 해당하는 마켓 정보가 없을 경우 NotFoundMarketException 예외 처리', async () => {
      jest
        .spyOn(marketRepository, 'findByMarketIdAndUserId')
        .mockResolvedValue(Promise.resolve(null));

      const createProductDto: CreateProductDto = new CreateProductDto();
      const userId: Types.ObjectId = new Types.ObjectId();

      await expect(
        productService.createProduct(createProductDto, userId),
      ).rejects.toThrowError(new NotFoundMarketException());
    });

    test('마켓 Id와 유저 Id에 해당하는 마켓 정보가 있을 경우 상품 등록', async () => {
      const createProductDto: CreateProductDto = new CreateProductDto();
      const userId: Types.ObjectId = new Types.ObjectId();
      const market = { _id: new Types.ObjectId() } as Market & {
        _id: Types.ObjectId;
      };
      const product = { _id: new Types.ObjectId() } as Product & {
        _id: Types.ObjectId;
      };

      jest
        .spyOn(marketRepository, 'findByMarketIdAndUserId')
        .mockResolvedValue(Promise.resolve(market));

      jest
        .spyOn(productRepository, 'create')
        .mockResolvedValue(Promise.resolve(product));

      const savedProduct = await productService.createProduct(
        createProductDto,
        userId,
      );

      expect(savedProduct).toEqual(product);
    });
  });
});
