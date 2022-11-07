import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../domain/user/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../../../domain/user/user.module';
import { AuthModule } from '../../../module/auth/auth.module';
import { User } from '../../../domain/user/user.schema';
import * as request from 'supertest';
import { validationPipe } from '../../../common/pipe/validation.pipe';
import { AuthErrorMessage } from '../../../module/auth/auth.message';
import * as bcrypt from 'bcrypt';
import { sessionConfig } from '../../../module/auth/auth.session.config';

describe('AuthController', () => {
  let app: NestFastifyApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGO_URL),
        AuthModule,
        UserModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('/api');
    validationPipe(app);
    sessionConfig(app);
    await app.init();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('POST /api/auth/signUp - 회원가입', () => {
    const email = 'ruby@gmail.com';
    beforeAll(async () => {
      await userRepository.deleteAll();

      await userRepository.create({
        email,
        password: 'asd123asd',
        name: 'ruby11',
        phone: '010-1111-2222',
      } as User);
    });

    test('이메일 중복 가입시 400 응답', async () => {
      const err = await request(app.getHttpServer())
        .post('/api/auth/signUp')
        .send({
          email,
          password: 'asd123asd',
          name: 'ruby11',
          phone: '01011112222',
        })
        .expect(400);

      return expect(err.body.message).toEqual(
        AuthErrorMessage.EXISTS_EMAIL_USER,
      );
    });

    test('회원 가입에 필요한 값들이 형식에 맞지 않을 경우 400 응답', async () => {
      const err = await request(app.getHttpServer())
        .post('/api/auth/signUp')
        .send({
          email: 'qwesad',
          password: 'asdasd',
          name: 'r',
          phone: '0101111',
        })
        .expect(400);

      await expect(err.body.message.length).toEqual(4);
      await expect(err.body.message).toContain(
        AuthErrorMessage.INVALID_PASSWORD,
      );
      await expect(err.body.message).toContain(AuthErrorMessage.INVALID_EMAIL);
      await expect(err.body.message).toContain(
        AuthErrorMessage.NAME_MIN_LENGTH,
      );
      await expect(err.body.message).toContain(AuthErrorMessage.INVALID_PHONE);
    });

    test('비밀번호에 숫자가 포함되지 않은 경우 400 응답', async () => {
      const err = await request(app.getHttpServer())
        .post('/api/auth/signUp')
        .send({
          email: 'diamond@gmail.com',
          password: 'asdfaasdsa',
          name: '김루비',
          phone: '01011112222',
        })
        .expect(400);

      await expect(err.body.message).toContain(
        AuthErrorMessage.INVALID_PASSWORD,
      );
    });

    test('비밀번호에 문자가 포함되지 않은 경우 400 응답', async () => {
      const err = await request(app.getHttpServer())
        .post('/api/auth/signUp')
        .send({
          email: 'diamond@gmail.com',
          password: '123123123',
          name: '김루비',
          phone: '01011112222',
        })
        .expect(400);

      await expect(err.body.message).toContain(
        AuthErrorMessage.INVALID_PASSWORD,
      );
    });

    test('비밀번호가 8글자 미만일 경우 400 응답', async () => {
      const err = await request(app.getHttpServer())
        .post('/api/auth/signUp')
        .send({
          email: 'diamond@gmail.com',
          password: '123asd3',
          name: '김루비',
          phone: '01011112222',
        })
        .expect(400);

      await expect(err.body.message).toContain(
        AuthErrorMessage.INVALID_PASSWORD,
      );
    });

    test('회원 가입 성공', async () => {
      return request(app.getHttpServer())
        .post('/api/auth/signUp')
        .send({
          email: 'diamond@gmail.com',
          password: 'asdfa12333',
          name: '김루비',
          phone: '01011112222',
        })
        .expect(201);
    });
  });

  describe('POST /api/auth/login - 로그인', () => {
    const email = 'ruby@gmail.com';
    const password = 'qwer1234';
    beforeAll(async () => {
      await userRepository.deleteAll();

      const hashedPassword = await bcrypt.hash(password, 12);

      await userRepository.create({
        email,
        password: hashedPassword,
        name: 'ruby11',
        phone: '010-1111-2222',
      } as User);
    });

    test('등록되지 않은 이메일로 로그인 요청시 401 응답', async () => {
      const err = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'radas@naver.com',
          password,
        })
        .expect(401);

      expect(err.body.message).toEqual(AuthErrorMessage.INVALID_USER);
    });

    test('일치하지 않는 비밀번호로 로그인 요청시 401 응답', async () => {
      const err = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email,
          password: 'asdasd12312',
        })
        .expect(401);

      expect(err.body.message).toEqual(AuthErrorMessage.INVALID_USER);
    });

    test('로그인 성공', async () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email,
          password,
        })
        .expect(201);
    });
  });
});
