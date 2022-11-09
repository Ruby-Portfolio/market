import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigModule } from '@nestjs/config';
import { MarketRepository } from '../../../../domain/market/market.repository';
import { MarketModule } from '../../../../domain/market/market.module';
import { UserRepository } from '../../../../domain/user/user.repository';
import { AuthModule } from '../../../../module/auth/auth.module';
import { validationPipe } from '../../../../common/pipe/validation.pipe';
import { sessionConfig } from '../../../../config/session.config';
import { ProductModule } from '../../../../domain/product/product.module';
import { ProductRepository } from '../../../../domain/product/product.repository';
import * as request from 'supertest';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../../../domain/user/user.schema';
import { Market } from '../../../../domain/market/market.schema';
import { MarketErrorMessage } from '../../../../domain/market/market.message';
import { ProductErrorMessage } from '../../../../domain/product/product.message';
import { Country } from '../../../../domain/common/enums/Country';
import { Category } from '../../../../domain/common/enums/Category';
import { CommonErrorMessage } from '../../../../common/error/common.message';
import { Product } from '../../../../domain/product/product.schema';
import { localDateTimeToString } from '../../../../common/util/dateUtil';
import { HttpStatus } from '@nestjs/common';

describe('ProductController', () => {
  let app: NestFastifyApplication;
  let userRepository: UserRepository;
  let marketRepository: MarketRepository;
  let productRepository: ProductRepository;
  const email = 'ruby@gmail.com';
  const password = 'qwer1234';
  let user: User & { _id: Types.ObjectId };
  let market: Market & { _id: Types.ObjectId };

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
      userId: user._id,
    } as Market);
  });

  describe('POST /api/products - 상품 등록', () => {
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
        .expect(HttpStatus.FORBIDDEN);
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
          .expect(HttpStatus.CREATED);
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
              marketId: new Types.ObjectId(),
            })
            .expect(HttpStatus.NOT_FOUND);

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
              marketId: 123,
            })
            .expect(HttpStatus.BAD_REQUEST);

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
            marketId: market._id,
          })
          .expect(HttpStatus.CREATED);

        const products = await productRepository.findAll();
        expect(products.length).toEqual(1);
      });
    });
  });

  describe('GET /api/products - 상품 목록 검색 조회', () => {
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
          marketId: market._id,
          userId: user._id,
        } as Product);
      }
    });

    test('상품 조회시 검색 조건 값들이 형식에 맞지 않을 경우 400 응답', async () => {
      const err = await request(app.getHttpServer())
        .get('/api/products')
        .query({
          country: '알수없는국가',
          category: '존재하지않는카테고리',
          page: 0,
          keyword: ['asd', 'asdsad'],
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(err.body.message.length).toEqual(4);
      expect(err.body.message).toContain(CommonErrorMessage.INVALID_COUNTRY);
      expect(err.body.message).toContain(CommonErrorMessage.INVALID_CATEGORY);
      expect(err.body.message).toContain(CommonErrorMessage.INVALID_PAGE);
      expect(err.body.message).toContain(CommonErrorMessage.INVALID_KEYWORD);
    });

    describe('상품 목록 검색 성공', () => {
      test('검색 조건을 입력하지 않을 경우 전체 상품 목록을 대상으로 조회', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/products')
          .query({})
          .expect(HttpStatus.OK);

        expect(res.body.products.length).toEqual(10);
      });

      test('조건에 맞는 상품 목록 조회', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/products')
          .query({
            country: Country.USA.toString(),
            category: Category.HOBBY.toString(),
            keyword: '플루트1',
          })
          .expect(HttpStatus.OK);

        expect(res.body.products.length).toEqual(3);
      });

      test('페이징 조회', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/products')
          .query({
            page: 2,
          })
          .expect(HttpStatus.OK);

        expect(res.body.products.length).toEqual(2);
      });
    });
  });

  describe('GET /api/products/:productId - 상품 상세 조회', () => {
    let product: Product & { _id: Types.ObjectId };
    beforeAll(async () => {
      await productRepository.deleteAll();

      product = await productRepository.create({
        name: '루비 플루트',
        price: 100000000,
        stock: 10,
        category: Category.HOBBY,
        country: market.country,
        deadline: new Date(`2022-11-20 10:00`),
        marketId: market._id,
        userId: user._id,
      } as Product);
    });

    test('존재하지 않는 상품 id로 상세 조회', async () => {
      const notExistsProductId = new Types.ObjectId().toString();
      const res = await request(app.getHttpServer())
        .get(`/api/products/${notExistsProductId}`)
        .expect(HttpStatus.OK);
      expect(res.body.product).toBeFalsy();
    });

    test('등록된 상품 id로 상세 조회', async () => {
      const productId = product._id.toString();
      const res = await request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .expect(HttpStatus.OK);

      expect(res.body.product.id).toEqual(productId);
      expect(res.body.product.name).toEqual(product.name);
      expect(res.body.product.price).toEqual(product.price);
      expect(res.body.product.country).toEqual(product.country);
      expect(res.body.product.deadline).toEqual(
        localDateTimeToString(product.deadline),
      );
      expect(res.body.product.market.id).toEqual(market._id.toString());
      expect(res.body.product.market.name).toEqual(market.name);
      expect(res.body.product.market.email).toEqual(market.email);
      expect(res.body.product.market.phone).toEqual(market.phone);
    });
  });

  describe('PATCH /api/products/:productId', () => {
    let product: Product & { _id: Types.ObjectId };
    beforeAll(async () => {
      await productRepository.deleteAll();

      product = await productRepository.create({
        name: '루비 플루트',
        price: 100000000,
        stock: 10,
        category: Category.HOBBY,
        country: market.country,
        deadline: new Date(`2022-11-20 10:00`),
        marketId: market._id,
        userId: user._id,
      } as Product);
    });

    test('로그인 하지 않은 상태에서 상품 수정 요청시 403 응답', async () => {
      const productId = product._id.toString();

      await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .send({
          name: '루비',
          price: 200000000,
          stock: 20,
          category: Category.JEWELRY,
          deadline: localDateTimeToString(new Date()),
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    describe('요청한 사용자와 셀러의 정보가 일치하지 않을 경우', () => {
      let agent;
      beforeEach(async () => {
        const email = 'qwer@naver.com';
        const password = 'asdf1234';
        const hashedPassword = await bcrypt.hash(password, 12);
        await userRepository.create({
          email,
          password: hashedPassword,
          name: 'ruby11',
          phone: '010-1111-2222',
        } as User);

        agent = await request.agent(app.getHttpServer());
        await agent
          .post('/api/auth/login')
          .send({
            email,
            password,
          })
          .expect(HttpStatus.CREATED);
      });

      test('요청한 사용자와 셀러의 정보가 일치하지 않을 경우 404 응답', async () => {
        const productId = product._id.toString();

        const err = await agent
          .patch(`/api/products/${productId}`)
          .send({
            name: '루비',
            price: 200000000,
            stock: 20,
            category: Category.JEWELRY,
            deadline: localDateTimeToString(new Date()),
          })
          .expect(HttpStatus.NOT_FOUND);

        expect(err.body.message).toEqual(ProductErrorMessage.NOT_FOUND);
      });
    });

    describe('로그인 상태에서 상품 정보 수정', () => {
      let agent;
      beforeEach(async () => {
        agent = await request.agent(app.getHttpServer());
        await agent
          .post('/api/auth/login')
          .send({
            email,
            password,
          })
          .expect(HttpStatus.CREATED);
      });

      describe('상품 정보 수정 실패', () => {
        test('등록되지 않은 상품의 정보 수정 요청시 404 응답', async () => {
          const notExistsProductId = new Types.ObjectId();

          const err = await agent
            .patch(`/api/products/${notExistsProductId}`)
            .send({
              name: '루비',
              price: 200000000,
              stock: 20,
              category: Category.JEWELRY,
              deadline: localDateTimeToString(new Date()),
            })
            .expect(HttpStatus.NOT_FOUND);

          expect(err.body.message).toEqual(ProductErrorMessage.NOT_FOUND);
        });
        test('상품 정보 수정시 필요한 값들이 형식에 맞지 않을 경우 400 응답', async () => {
          const productId = product._id.toString();

          const err = await agent
            .patch(`/api/products/${productId}`)
            .send({
              name: '',
              price: null,
              stock: null,
              category: '임의의카테고리',
              deadline: '2022',
            })
            .expect(HttpStatus.BAD_REQUEST);

          expect(err.body.message.length).toEqual(5);
          expect(err.body.message).toContain(ProductErrorMessage.EMPTY_NAME);
          expect(err.body.message).toContain(ProductErrorMessage.INVALID_PRICE);
          expect(err.body.message).toContain(ProductErrorMessage.INVALID_STOCK);
          expect(err.body.message).toContain(
            ProductErrorMessage.INVALID_DEADLINE,
          );
          expect(err.body.message).toContain(
            CommonErrorMessage.INVALID_CATEGORY,
          );
        });
      });

      test('상품 정보 수정 성공', async () => {
        const productId = product._id.toString();

        const updateProduct = {
          name: '루비',
          price: 200000000,
          stock: 20,
          category: Category.JEWELRY,
          deadline: localDateTimeToString(new Date()),
        };

        await agent
          .patch(`/api/products/${productId}`)
          .send(updateProduct)
          .expect(HttpStatus.NO_CONTENT);

        const updatedProduct = await productRepository.findDetailInfoById(
          productId,
        );

        expect(updatedProduct.name).toEqual(updateProduct.name);
        expect(updatedProduct.price).toEqual(updateProduct.price);
        expect(updatedProduct.stock).toEqual(updateProduct.stock);
        expect(updatedProduct.category).toEqual(updateProduct.category);
        expect(localDateTimeToString(updatedProduct.deadline)).toEqual(
          updateProduct.deadline,
        );
      });
    });
  });

  describe('DELETE /api/products/:productId', () => {
    let product: Product & { _id: Types.ObjectId };
    beforeAll(async () => {
      await productRepository.deleteAll();

      product = await productRepository.create({
        name: '루비 플루트',
        price: 100000000,
        stock: 10,
        category: Category.HOBBY,
        country: market.country,
        deadline: new Date(`2022-11-20 10:00`),
        marketId: market._id,
        userId: user._id,
      } as Product);
    });

    test('로그인 하지 않은 상태에서 상품 삭제 요청시 403 응답', async () => {
      const productId = product._id.toString();

      await request(app.getHttpServer())
        .delete(`/api/products/${productId}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    describe('요청한 사용자와 셀러의 정보가 일치하지 않을 경우', () => {
      let agent;
      beforeEach(async () => {
        const email = 'qwer@naver.com';
        const password = 'asdf1234';
        const hashedPassword = await bcrypt.hash(password, 12);
        await userRepository.create({
          email,
          password: hashedPassword,
          name: 'ruby11',
          phone: '010-1111-2222',
        } as User);

        agent = await request.agent(app.getHttpServer());
        await agent
          .post('/api/auth/login')
          .send({
            email,
            password,
          })
          .expect(HttpStatus.CREATED);
      });

      test('요청한 사용자와 셀러의 정보가 일치하지 않을 경우 404 응답', async () => {
        const productId = product._id.toString();

        const err = await agent
          .delete(`/api/products/${productId}`)
          .expect(HttpStatus.NOT_FOUND);

        expect(err.body.message).toEqual(ProductErrorMessage.NOT_FOUND);
      });
    });

    describe('로그인 상태에서 상품 정보 삭제', () => {
      let agent;
      beforeEach(async () => {
        agent = await request.agent(app.getHttpServer());
        await agent
          .post('/api/auth/login')
          .send({
            email,
            password,
          })
          .expect(HttpStatus.CREATED);
      });

      test('존재하지 않는 상품 정보 삭제 요청시 404 응답', async () => {
        const notExistsProductId = new Types.ObjectId().toString();

        const err = await agent
          .delete(`/api/products/${notExistsProductId}`)
          .expect(HttpStatus.NOT_FOUND);

        expect(err.body.message).toEqual(ProductErrorMessage.NOT_FOUND);
      });

      test('상품 정보 삭제 성공', async () => {
        const productId = product._id.toString();

        await agent
          .delete(`/api/products/${productId}`)
          .expect(HttpStatus.NO_CONTENT);

        const products = await productRepository.findAll();
        expect(products.length).toEqual(0);
      });
    });
  });
});
