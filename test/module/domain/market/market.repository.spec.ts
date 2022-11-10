import { Test, TestingModule } from '@nestjs/testing';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MarketRepository } from '../../../../src/domain/market/market.repository';
import { UserRepository } from '../../../../src/domain/user/user.repository';
import { UserModule } from '../../../../src/domain/user/user.module';
import { MarketModule } from '../../../../src/domain/market/market.module';
import { User } from '../../../../src/domain/user/user.schema';
import { Market } from '../../../../src/domain/market/market.schema';
import { Country } from '../../../../src/domain/common/enums/country';

describe('MarketRepository', () => {
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
        UserModule,
        MarketModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get<UserRepository>(UserRepository);
    marketRepository = module.get<MarketRepository>(MarketRepository);
  });

  describe('findByMarketIdAndUserId - 마켓 Id와 사용자 Id에 해당하는 마켓 정보 조회', () => {
    const email = 'ruby@gmail.com';
    let user: User;
    let market: Market;
    beforeEach(async () => {
      await marketRepository.deleteAll();
      await userRepository.deleteAll();

      user = await userRepository.create({
        email,
        password: 'asd123asd',
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

    test('등록되지 않은 마켓 Id로 조회', async () => {
      const optionId = new Types.ObjectId();

      const exists = await marketRepository.findByMarketIdAndUserId(
        optionId,
        user._id,
      );

      expect(exists).toBeFalsy();
    });

    test('마켓 정보에 일치하지 않는 사용자 Id로 조회', async () => {
      const optionId = new Types.ObjectId();

      const exists = await marketRepository.findByMarketIdAndUserId(
        market._id,
        optionId,
      );

      expect(exists).toBeFalsy();
    });

    test('마켓 Id와 사용자 Id에 해당하는 마켓 정보가 있을 경우 조회', async () => {
      const exists = await marketRepository.findByMarketIdAndUserId(
        market._id,
        user._id,
      );

      expect(exists).toBeTruthy();
    });
  });
});
