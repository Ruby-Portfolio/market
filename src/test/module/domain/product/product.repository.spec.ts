import { Test, TestingModule } from '@nestjs/testing';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductRepository } from '../../../../domain/product/product.repository';
import { SearchProductsDto } from '../../../../domain/product/product.request.dto';
import { ProductModule } from '../../../../domain/product/product.module';
import { UserModule } from '../../../../domain/user/user.module';
import { MarketModule } from '../../../../domain/market/market.module';
import { UserRepository } from '../../../../domain/user/user.repository';
import { MarketRepository } from '../../../../domain/market/market.repository';
import * as bcrypt from 'bcrypt';
import { User } from '../../../../domain/user/user.schema';
import { Country } from '../../../../domain/common/enums/Country';
import { Market } from '../../../../domain/market/market.schema';
import { Category } from '../../../../domain/common/enums/Category';
import { Product } from '../../../../domain/product/product.schema';
import { Types } from 'mongoose';

describe('ProductRepository', () => {
  let app: NestFastifyApplication;
  let userRepository: UserRepository;
  let marketRepository: MarketRepository;
  let productRepository: ProductRepository;
  let market: Market & { _id: Types.ObjectId };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGO_URL),
        UserModule,
        MarketModule,
        ProductModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get<UserRepository>(UserRepository);
    marketRepository = module.get<MarketRepository>(MarketRepository);
    productRepository = module.get<ProductRepository>(ProductRepository);

    await productRepository.deleteAll();
    await marketRepository.deleteAll();
    await userRepository.deleteAll();

    const hashedPassword = await bcrypt.hash('qwer1234', 12);
    const user = await userRepository.create({
      email: 'ruby@gmail.com',
      password: hashedPassword,
      name: 'ruby11',
      phone: '010-1111-2222',
    } as User);
    market = await marketRepository.create({
      name: '허밍 플루트',
      email: 'flute@naver.com',
      phone: '01011112222',
      country: Country.USA,
      user: user._id,
    } as Market);
  });

  describe('findBySearch - 검색을 통해 상품 목록 조회', () => {
    beforeAll(async () => {
      await productRepository.deleteAll();

      for (let i = 0; i < 12; i++) {
        await productRepository.create({
          name: `루비 플루트${i}`,
          price: 100000000,
          stock: 10,
          category: Category.HOBBY,
          country: market.country,
          deadline: new Date(`2022-11-08 ${10 + i}:00`),
          market: market._id,
        } as Product);
      }
    });

    describe('키워드로 검색하여 조회', () => {
      test('키워드를 포함한 상품들이 없는 경우', async () => {
        const keyword = '바이올린';
        const searchProducts: SearchProductsDto = {
          keyword,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(0);
      });

      test('키워드를 포함한 상품들이 있는 경우', async () => {
        const keyword = '루트';
        const searchProducts: SearchProductsDto = {
          keyword,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(10);
      });

      test('키워드 사이에 공백이 있는 경우 공백으로 키워드를 잘라서 or 검색', async () => {
        const keyword = '5 9';
        const searchProducts: SearchProductsDto = {
          keyword,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(2);
        expect(result[0].name).toEqual('루비 플루트9');
        expect(result[1].name).toEqual('루비 플루트5');
      });
    });

    describe('국가로 분류하여 조회', () => {
      test('국가에 포함된 상품들이 없는 경우', async () => {
        const country = Country.GERMANY;
        const searchProducts: SearchProductsDto = {
          country,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(0);
      });

      test('국가에 포함된 상품들이 있는 경우', async () => {
        const country = Country.USA;
        const searchProducts: SearchProductsDto = {
          country,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(10);
        expect(
          result.every((product) => product.country === country),
        ).toBeTruthy();
      });
    });

    describe('카테고리로 분류하여 조회', () => {
      test('카테고리에 포함된 상품들이 없는 경우', async () => {
        const category = Category.BABY;
        const searchProducts: SearchProductsDto = {
          category,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(0);
      });

      test('카테고리에 포함된 상품들이 있는 경우', async () => {
        const category = Category.HOBBY;
        const searchProducts: SearchProductsDto = {
          category,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(10);
        expect(
          result.every((product) => product.category === category),
        ).toBeTruthy();
      });
    });

    describe('복합 검색', () => {
      test('국가와 카테고리는 일치하지만 키워드에 해당하는 상품 명이 없는 경우', async () => {
        const country = Country.USA;
        const category = Category.HOBBY;
        const keyword = '바이올린';
        const searchProducts: SearchProductsDto = {
          country,
          category,
          keyword,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(0);
      });

      test('국가와 키워드에 해당하는 상품이 있지만 카테고리에 해당하는 상품이 없는 경우', async () => {
        const country = Country.USA;
        const category = Category.CLOTHING;
        const keyword = '플루트';
        const searchProducts: SearchProductsDto = {
          country,
          category,
          keyword,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(0);
      });

      test('카테고리와 키워드에 해당하는 상품이 있지만 국가에 해당하는 상품이 없는 경우', async () => {
        const country = Country.HONG_KONG;
        const category = Category.HOBBY;
        const keyword = '플루트';
        const searchProducts: SearchProductsDto = {
          country,
          category,
          keyword,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(0);
      });

      test('국가와 카테고리, 키워드에 해당하는 상품명이 있을 경우', async () => {
        const country = Country.USA;
        const category = Category.HOBBY;
        const keyword = '플루트';
        const searchProducts: SearchProductsDto = {
          country,
          category,
          keyword,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(10);
        expect(
          result.every((product) => product.category === category),
        ).toBeTruthy();
        expect(
          result.every((product) => product.country === country),
        ).toBeTruthy();
        expect(
          result.every((product) => product.name.includes(keyword)),
        ).toBeTruthy();
      });
    });

    describe('페이징 조회', () => {
      test('전체 범위를 초과하는 페이지 번호로 조회', async () => {
        const searchProducts: SearchProductsDto = {
          page: 3,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(0);
      });

      test('전체 범위 내의 페이지 번호로 조회', async () => {
        const searchProducts: SearchProductsDto = {
          page: 2,
        };

        const result = await productRepository.findBySearch(searchProducts);
        expect(result.length).toEqual(2);
      });
    });
  });

  describe('findDetailInfoById - 상품 상세 조회', () => {
    let product: Product & { _id: Types.ObjectId };
    beforeAll(async () => {
      await productRepository.deleteAll();

      product = await productRepository.create({
        name: '루비 플루트$',
        price: 100000000,
        stock: 10,
        category: Category.HOBBY,
        country: market.country,
        deadline: new Date(`2022-11-20 10:00`),
        market: market._id,
      } as Product);
    });

    test('존재하지 않는 상품 id로 상품 상세 조회', async () => {
      const findProduct = await productRepository.findDetailInfoById(
        new Types.ObjectId(),
      );

      expect(findProduct).toBeFalsy();
    });
    test('상품 id로 상품 상세 조회', async () => {
      const findProduct = await productRepository.findDetailInfoById(
        product._id,
      );

      expect(findProduct._id).toEqual(product._id);
    });
  });
});
