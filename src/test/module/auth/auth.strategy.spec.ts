import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../domain/user/user.repository';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../../domain/user/user.schema';
import { AuthStrategy } from '../../../module/auth/auth.strategy';
import { InvalidUserInfoException } from '../../../module/auth/auth.exception';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

describe('AuthStrategy', () => {
  let userRepository: UserRepository;
  let authStrategy: AuthStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        AuthStrategy,
        {
          provide: getModelToken(User.name),
          useFactory: () => {},
        },
      ],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
    authStrategy = await module.get<AuthStrategy>(AuthStrategy);
  });

  describe('validate - 로그인 인증', () => {
    test('이메일에 해당하는 사용자 정보가 없는 경우 InvalidUserInfoException 예외 처리', async () => {
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockResolvedValue(Promise.resolve(null));

      const email = 'ruby@gmail.com';
      const password = 'asdqwe123';

      await expect(authStrategy.validate(email, password)).rejects.toThrowError(
        new InvalidUserInfoException(),
      );
    });

    test('비밀번호가 일치하지 않는 경우 InvalidUserInfoException 예외 처리', async () => {
      const email = 'ruby@gmail.com';
      const password = 'asdqwe123';
      const hashedPassword = await bcrypt.hash(password, 12);
      const findUser: User & { _id: Types.ObjectId } = {
        email,
        password: hashedPassword,
      } as User & { _id: Types.ObjectId };

      jest
        .spyOn(userRepository, 'findByEmail')
        .mockResolvedValue(Promise.resolve(findUser));

      const badPassword = password + '123';
      await expect(
        authStrategy.validate(email, badPassword),
      ).rejects.toThrowError(new InvalidUserInfoException());
    });

    test('로그인 인증 성공', async () => {
      const email = 'ruby@gmail.com';
      const password = 'asdqwe123';
      const hashedPassword = await bcrypt.hash(password, 12);
      const findUser: User & { _id: Types.ObjectId } = {
        email,
        password: hashedPassword,
      } as User & { _id: Types.ObjectId };

      jest
        .spyOn(userRepository, 'findByEmail')
        .mockResolvedValue(Promise.resolve(findUser));

      const loginUser = await authStrategy.validate(email, password);
      expect(loginUser.email).toEqual(findUser.email);
    });
  });
});
