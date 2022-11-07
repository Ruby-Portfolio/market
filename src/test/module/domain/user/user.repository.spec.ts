import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../../domain/user/user.repository';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../../../../domain/user/user.module';
import { User } from '../../../../domain/user/user.schema';

describe('UserRepository', () => {
  let app: NestFastifyApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGO_URL),
        UserModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('existByEmail - 이메일에 해당하는 유저 정보 존재 여부', () => {
    const email = 'ruby@gmail.com';
    beforeEach(async () => {
      await userRepository.deleteAll();

      await userRepository.create({
        email,
        password: 'asd123asd',
        name: 'ruby11',
        phone: '010-1111-2222',
      } as User);
    });

    test('해당 이메일로 가입된 유저 정보가 존재할 경우 true 반환', async () => {
      const exists = await userRepository.existByEmail(email);

      expect(exists).toBeTruthy();
    });

    test('해당 이메일로 가입된 유저 정보가 없는 경우 false 반환', async () => {
      const exists = await userRepository.existByEmail('asdasd@naver.com');

      expect(exists).toBeFalsy();
    });
  });
});
