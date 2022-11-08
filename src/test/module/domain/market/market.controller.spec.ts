import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { MarketRepository } from '../../../../domain/market/market.repository';
import { MarketModule } from '../../../../domain/market/market.module';
import { UserRepository } from '../../../../domain/user/user.repository';
import { AuthModule } from '../../../../module/auth/auth.module';
import { validationPipe } from '../../../../common/pipe/validation.pipe';
import { sessionConfig } from '../../../../module/auth/auth.session.config';
import { User } from '../../../../domain/user/user.schema';
import { CommonErrorMessage } from '../../../../common/error/common.message';
import { MarketErrorMessage } from '../../../../domain/market/market.message';
import { Country } from '../../../../domain/enums/Country';

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

    app = module.createNestApplication();
    app.setGlobalPrefix('/api');
    validationPipe(app);
    sessionConfig(app);
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
        .expect(403);
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
          .expect(201);
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
          .expect(400);

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
          .expect(201);

        const markets = await marketRepository.findAll();
        expect(markets.length).toEqual(1);
      });
    });
  });
});
