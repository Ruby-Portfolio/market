import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigModule } from '@nestjs/config';
import { MarketRepository } from '../../../../domain/market/market.repository';
import { MarketModule } from '../../../../domain/market/market.module';
import { UserRepository } from '../../../../domain/user/user.repository';
import { AuthModule } from '../../../../module/auth/auth.module';
import { validationPipe } from '../../../../common/pipe/validation.pipe';
import { sessionConfig } from '../../../../module/auth/auth.session.config';
import { ProductModule } from '../../../../domain/product/product.module';
import { ProductRepository } from '../../../../domain/product/product.repository';
import * as request from 'supertest';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../../../domain/user/user.schema';
import { Market } from '../../../../domain/market/market.schema';
import { MarketErrorMessage } from '../../../../domain/market/market.message';
import { ProductErrorMessage } from '../../../../domain/product/product.message';
import { Country } from '../../../../domain/enums/Country';
import { Category } from '../../../../domain/enums/Category';
import { CommonErrorMessage } from '../../../../common/error/common.message';

describe('ProductController', () => {
  let app: NestFastifyApplication;
  let userRepository: UserRepository;
  let marketRepository: MarketRepository;
  let productRepository: ProductRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGO_URL),
        AuthModule,
        MarketModule,
        ProductModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('/api');
    validationPipe(app);
    sessionConfig(app);
    await app.init();

    userRepository = module.get<UserRepository>(UserRepository);
    marketRepository = module.get<MarketRepository>(MarketRepository);
    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  describe('POST /api/products - 상품 등록', () => {
    const email = 'ruby@gmail.com';
    const password = 'qwer1234';
    let user: User & { _id: Types.ObjectId };
    let market: Market & { _id: Types.ObjectId };
    beforeAll(async () => {
      await productRepository.deleteAll();
      await marketRepository.deleteAll();
      await userRepository.deleteAll();

      const hashedPassword = await bcrypt.hash(password, 12);
      user = await userRepository.create({
        email,
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

    test('로그인 하지 않은 상태에서 상품 등록시 403 응답', async () => {
      return request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: '플루트',
          price: 20000000,
          stock: 5,
          deadline: new Date(),
          category: Category.HOBBY.toString(),
          market: market._id,
        })
        .expect(403);
    });

    describe('로그인 상태에서 상품 등록', () => {
      let agent;
      beforeEach(async () => {
        agent = await request.agent(app.getHttpServer());
        await agent
          .post('/api/auth/login')
          .send({
            email,
            password,
          })
          .expect(201);
      });
      describe('상품 등록 실패', () => {
        test('등록되지 않은 마켓 Id로 상품 등록 시 404 응답', async () => {
          const err = await agent
            .post('/api/products')
            .send({
              name: '플루트',
              price: 20000000,
              stock: 5,
              deadline: '2022-11-08 10:00',
              category: Category.HOBBY.toString(),
              market: new Types.ObjectId(),
            })
            .expect(404);

          expect(err.body.message).toEqual(MarketErrorMessage.NOT_FOUND);
        });
        test('상품 등록시 필요한 값들이 형식에 맞지 않을 경우 400 응답', async () => {
          const err = await agent
            .post('/api/products')
            .send({
              name: '',
              price: null,
              stock: null,
              category: '랜덤카테고리',
              deadline: '2022-02-02 10:66',
              market: 123,
            })
            .expect(400);

          console.log(err.body.message);

          expect(err.body.message.length).toEqual(6);
          expect(err.body.message).toContain(ProductErrorMessage.EMPTY_NAME);
          expect(err.body.message).toContain(ProductErrorMessage.INVALID_PRICE);
          expect(err.body.message).toContain(ProductErrorMessage.INVALID_STOCK);
          expect(err.body.message).toContain(
            ProductErrorMessage.INVALID_DEADLINE,
          );
          expect(err.body.message).toContain(
            CommonErrorMessage.INVALID_CATEGORY,
          );
          expect(err.body.message).toContain(
            MarketErrorMessage.INVALID_MARKET_ID,
          );
        });
      });

      test('상품 등록 성공', async () => {
        await agent
          .post('/api/products')
          .send({
            name: '플루트',
            price: 100000000,
            stock: 10,
            category: Category.HOBBY.toString(),
            deadline: '2022-11-08 10:00',
            market: market._id,
          })
          .expect(201);

        const products = await productRepository.findAll();
        expect(products.length).toEqual(1);
      });
    });
  });
});
