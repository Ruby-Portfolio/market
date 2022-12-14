import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '@nestjs/common';
import { UserRepository } from '../../../../src/domain/user/user.repository';
import { MarketRepository } from '../../../../src/domain/market/market.repository';
import { ProductRepository } from '../../../../src/domain/product/product.repository';
import { User } from '../../../../src/domain/user/user.schema';
import { Market } from '../../../../src/domain/market/market.schema';
import { AuthModule } from '../../../../src/module/auth/auth.module';
import { MarketModule } from '../../../../src/domain/market/market.module';
import { ProductModule } from '../../../../src/domain/product/product.module';
import { Country } from '../../../../src/domain/common/enums/country';
import { Category } from '../../../../src/domain/common/enums/category';
import { MarketErrorMessage } from '../../../../src/domain/market/market.message';
import { ProductErrorMessage } from '../../../../src/domain/product/product.message';
import { CommonErrorMessage } from '../../../../src/common/error/common.message';
import { Product } from '../../../../src/domain/product/product.schema';
import { localDateTimeToString } from '../../../../src/common/util/dateUtil';
import { ProductOrder } from '../../../../src/domain/product/product.enum';
import { testApp } from '../../testAppInit';

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

    app = testApp(module);
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
      name: '?????? ?????????',
      email: 'flute@naver.com',
      phone: '01011112222',
      country: Country.USA,
      userId: user._id,
    } as Market);
  });

  describe('POST /api/products - ?????? ??????', () => {
    test('????????? ?????? ?????? ???????????? ?????? ????????? 403 ??????', async () => {
      return request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: '?????????',
          price: 20000000,
          stock: 5,
          deadline: new Date(),
          category: Category.HOBBY.toString(),
          market: market._id,
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    describe('????????? ???????????? ?????? ??????', () => {
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
      describe('?????? ?????? ??????', () => {
        test('???????????? ?????? ?????? Id??? ?????? ?????? ??? 404 ??????', async () => {
          const err = await agent
            .post('/api/products')
            .send({
              name: '?????????',
              price: 20000000,
              stock: 5,
              deadline: '2022-11-08 10:00',
              category: Category.HOBBY.toString(),
              marketId: new Types.ObjectId(),
            })
            .expect(HttpStatus.NOT_FOUND);

          expect(err.body.message).toEqual(MarketErrorMessage.NOT_FOUND);
        });
        test('?????? ????????? ????????? ????????? ????????? ?????? ?????? ?????? 400 ??????', async () => {
          const err = await agent
            .post('/api/products')
            .send({
              name: '',
              price: null,
              stock: null,
              category: '??????????????????',
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

      test('?????? ?????? ??????', async () => {
        await agent
          .post('/api/products')
          .send({
            name: '?????????',
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

  describe('GET /api/products - ?????? ?????? ?????? ??????', () => {
    beforeAll(async () => {
      await productRepository.deleteAll();

      for (let i = 0; i < 12; i++) {
        await productRepository.create({
          name: `?????? ?????????${i}`,
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

    test('?????? ????????? ?????? ?????? ????????? ????????? ?????? ?????? ?????? 400 ??????', async () => {
      const err = await request(app.getHttpServer())
        .get('/api/products')
        .query({
          country: '??????????????????',
          category: '??????????????????????????????',
          order: '???????????? ?????? ????????????',
          page: 0,
          keyword: ['asd', 'asdsad'],
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(err.body.message.length).toEqual(5);
      expect(err.body.message).toContain(CommonErrorMessage.INVALID_COUNTRY);
      expect(err.body.message).toContain(CommonErrorMessage.INVALID_CATEGORY);
      expect(err.body.message).toContain(
        ProductErrorMessage.INVALID_PRODUCT_ORDER,
      );
      expect(err.body.message).toContain(CommonErrorMessage.INVALID_PAGE);
      expect(err.body.message).toContain(CommonErrorMessage.INVALID_KEYWORD);
    });

    describe('?????? ?????? ?????? ??????', () => {
      test('?????? ????????? ???????????? ?????? ?????? ?????? ?????? ????????? ???????????? ??????', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/products')
          .query({})
          .expect(HttpStatus.OK);

        expect(res.body.products.length).toEqual(10);
      });

      test('????????? ?????? ?????? ?????? ??????', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/products')
          .query({
            country: Country.USA.toString(),
            category: Category.HOBBY.toString(),
            keyword: '?????????1',
          })
          .expect(HttpStatus.OK);

        expect(res.body.products.length).toEqual(3);
      });

      test('????????? ??????', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/products')
          .query({
            page: 2,
          })
          .expect(HttpStatus.OK);

        expect(res.body.products.length).toEqual(2);
      });

      describe('?????? ??????', () => {
        test('???', async () => {
          const res = await request(app.getHttpServer())
            .get('/api/products')
            .query({
              page: 2,
            })
            .expect(HttpStatus.OK);

          expect(res.body.products.length).toEqual(2);
          expect(
            res.body.products[0].id > res.body.products[1].id,
          ).toBeTruthy();
        });

        test('?????? ????????? ?????? ?????? ?????? ?????? ????????? ??????', async () => {
          const res = await request(app.getHttpServer())
            .get('/api/products')
            .query({
              order: ProductOrder.NEW,
              page: 2,
            })
            .expect(HttpStatus.OK);

          expect(res.body.products.length).toEqual(2);
          expect(
            res.body.products[0].id > res.body.products[1].id,
          ).toBeTruthy();
        });

        test('?????? ????????? ?????? ????????? ?????? ?????? ?????? ?????? ????????? ??????', async () => {
          const res = await request(app.getHttpServer())
            .get('/api/products')
            .query({
              order: ProductOrder.DEADLINE,
              page: 2,
            })
            .expect(HttpStatus.OK);

          expect(res.body.products.length).toEqual(2);
          expect(
            res.body.products[0].id < res.body.products[1].id,
          ).toBeTruthy();
        });
      });
    });
  });

  describe('GET /api/products/:productId - ?????? ?????? ??????', () => {
    let product: Product & { _id: Types.ObjectId };
    beforeAll(async () => {
      await productRepository.deleteAll();

      product = await productRepository.create({
        name: '?????? ?????????',
        price: 100000000,
        stock: 10,
        category: Category.HOBBY,
        country: market.country,
        deadline: new Date(`2022-11-20 10:00`),
        marketId: market._id,
        userId: user._id,
      } as Product);
    });

    test('???????????? ?????? ?????? id??? ?????? ??????', async () => {
      const notExistsProductId = new Types.ObjectId().toString();
      const res = await request(app.getHttpServer())
        .get(`/api/products/${notExistsProductId}`)
        .expect(HttpStatus.OK);
      expect(res.body.product).toBeFalsy();
    });

    test('????????? ?????? id??? ?????? ??????', async () => {
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
        name: '?????? ?????????',
        price: 100000000,
        stock: 10,
        category: Category.HOBBY,
        country: market.country,
        deadline: new Date(`2022-11-20 10:00`),
        marketId: market._id,
        userId: user._id,
      } as Product);
    });

    test('????????? ?????? ?????? ???????????? ?????? ?????? ????????? 403 ??????', async () => {
      const productId = product._id.toString();

      await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .send({
          name: '??????',
          price: 200000000,
          stock: 20,
          category: Category.JEWELRY,
          deadline: localDateTimeToString(new Date()),
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    describe('????????? ???????????? ????????? ????????? ???????????? ?????? ??????', () => {
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

      test('????????? ???????????? ????????? ????????? ???????????? ?????? ?????? 404 ??????', async () => {
        const productId = product._id.toString();

        const err = await agent
          .patch(`/api/products/${productId}`)
          .send({
            name: '??????',
            price: 200000000,
            stock: 20,
            category: Category.JEWELRY,
            deadline: localDateTimeToString(new Date()),
          })
          .expect(HttpStatus.NOT_FOUND);

        expect(err.body.message).toEqual(ProductErrorMessage.NOT_FOUND);
      });
    });

    describe('????????? ???????????? ?????? ?????? ??????', () => {
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

      describe('?????? ?????? ?????? ??????', () => {
        test('???????????? ?????? ????????? ?????? ?????? ????????? 404 ??????', async () => {
          const notExistsProductId = new Types.ObjectId();

          const err = await agent
            .patch(`/api/products/${notExistsProductId}`)
            .send({
              name: '??????',
              price: 200000000,
              stock: 20,
              category: Category.JEWELRY,
              deadline: localDateTimeToString(new Date()),
            })
            .expect(HttpStatus.NOT_FOUND);

          expect(err.body.message).toEqual(ProductErrorMessage.NOT_FOUND);
        });
        test('?????? ?????? ????????? ????????? ????????? ????????? ?????? ?????? ?????? 400 ??????', async () => {
          const productId = product._id.toString();

          const err = await agent
            .patch(`/api/products/${productId}`)
            .send({
              name: '',
              price: null,
              stock: null,
              category: '?????????????????????',
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

      test('?????? ?????? ?????? ??????', async () => {
        const productId = product._id.toString();

        const updateProduct = {
          name: '??????',
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
        name: '?????? ?????????',
        price: 100000000,
        stock: 10,
        category: Category.HOBBY,
        country: market.country,
        deadline: new Date(`2022-11-20 10:00`),
        marketId: market._id,
        userId: user._id,
      } as Product);
    });

    test('????????? ?????? ?????? ???????????? ?????? ?????? ????????? 403 ??????', async () => {
      const productId = product._id.toString();

      await request(app.getHttpServer())
        .delete(`/api/products/${productId}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    describe('????????? ???????????? ????????? ????????? ???????????? ?????? ??????', () => {
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

      test('????????? ???????????? ????????? ????????? ???????????? ?????? ?????? 404 ??????', async () => {
        const productId = product._id.toString();

        const err = await agent
          .delete(`/api/products/${productId}`)
          .expect(HttpStatus.NOT_FOUND);

        expect(err.body.message).toEqual(ProductErrorMessage.NOT_FOUND);
      });
    });

    describe('????????? ???????????? ?????? ?????? ??????', () => {
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

      test('???????????? ?????? ?????? ?????? ?????? ????????? 404 ??????', async () => {
        const notExistsProductId = new Types.ObjectId().toString();

        const err = await agent
          .delete(`/api/products/${notExistsProductId}`)
          .expect(HttpStatus.NOT_FOUND);

        expect(err.body.message).toEqual(ProductErrorMessage.NOT_FOUND);
      });

      test('?????? ?????? ?????? ??????', async () => {
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
