import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

import { HttpStatus } from '@nestjs/common';
import { UserRepository } from '../../../../src/domain/user/user.repository';
import { MarketRepository } from '../../../../src/domain/market/market.repository';
import { AuthModule } from '../../../../src/module/auth/auth.module';
import { MarketModule } from '../../../../src/domain/market/market.module';
import { User } from '../../../../src/domain/user/user.schema';
import { Country } from '../../../../src/domain/common/enums/country';
import { MarketErrorMessage } from '../../../../src/domain/market/market.message';
import { CommonErrorMessage } from '../../../../src/common/error/common.message';
import { testApp } from '../../testAppInit';

describe('MarketController', () => {
  let app: NestFastifyApplication;
  let userRepository: UserRepository;
  let marketRepository: MarketRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGO_URL),
        AuthModule,
        MarketModule,
      ],
    }).compile();

    app = testApp(module);
    await app.init();

    userRepository = module.get<UserRepository>(UserRepository);
    marketRepository = module.get<MarketRepository>(MarketRepository);
  });

  describe('POST /api/markets - 마켓 등록(셀러 입점)', () => {
    const email = 'ruby@gmail.com';
    const password = 'qwer1234';
    beforeAll(async () => {
      await marketRepository.deleteAll();
      await userRepository.deleteAll();
      const hashedPassword = await bcrypt.hash(password, 12);
      await userRepository.create({
        email,
        password: hashedPassword,
        name: 'ruby11',
        phone: '010-1111-2222',
      } as User);
    });

    test('로그인 하지 않은 상태에서 마켓 등록시 403 응답', async () => {
      return request(app.getHttpServer())
        .post('/api/markets')
        .send({
          name: '허밍 플루트',
          email: 'flute@naver.com',
          phone: '010-1111-2222',
          country: Country.USA.toString(),
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    describe('로그인 상태에서 마켓 등록', () => {
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

      test('마켓 등록시 필요한 값들이 형식에 맞지 않을 경우 400 응답', async () => {
        const err = await agent
          .post('/api/markets')
          .send({
            name: '',
            email: 'flute.com',
            phone: '010-1111-2',
            country: '',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(err.body.message.length).toEqual(4);
        expect(err.body.message).toContain(MarketErrorMessage.EMPTY_NAME);
        expect(err.body.message).toContain(CommonErrorMessage.INVALID_PHONE);
        expect(err.body.message).toContain(CommonErrorMessage.INVALID_EMAIL);
        expect(err.body.message).toContain(CommonErrorMessage.INVALID_COUNTRY);
      });

      test('마켓 등록 성공시 201 응답', async () => {
        await agent
          .post('/api/markets')
          .send({
            name: '허밍 플루트',
            email: 'flute@naver.com',
            phone: '010-1111-2222',
            country: Country.USA.toString(),
          })
          .expect(HttpStatus.CREATED);

        const markets = await marketRepository.findAll();
        expect(markets.length).toEqual(1);
      });
    });
  });
});
