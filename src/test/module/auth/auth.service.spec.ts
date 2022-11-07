import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../module/auth/auth.service';
import { UserRepository } from '../../../domain/user/user.repository';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../../domain/user/user.schema';
import { ExistsEmailUserException } from '../../../module/auth/auth.exception';
import { Types } from 'mongoose';

describe('AuthService', () => {
  let userRepository: UserRepository;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserRepository,
        {
          provide: getModelToken(User.name),
          useFactory: () => {},
        },
      ],
    }).compile();
    userRepository = await module.get<UserRepository>(UserRepository);
    authService = await module.get<AuthService>(AuthService);
  });

  describe('signUp - 회원가입', () => {
    test('이메일 중복 가입시 ExistsEmailUserException 예외 처리', async () => {
      jest
        .spyOn(userRepository, 'existByEmail')
        .mockResolvedValue(Promise.resolve(true));

      await expect(
        authService.signUp({
          email: 'ruby@gmail.com',
          password: 'asd123',
          name: 'ruby11',
          phone: '01011112222',
        }),
      ).rejects.toThrowError(new ExistsEmailUserException());
    });

    test('회원 가입 성공', async () => {
      jest
        .spyOn(userRepository, 'existByEmail')
        .mockResolvedValue(Promise.resolve(false));
      jest
        .spyOn(userRepository, 'create')
        .mockResolvedValue(
          Promise.resolve({ name: 'ruby' } as User & { _id: Types.ObjectId }),
        );

      const savedUser = await authService.signUp({
        email: 'ruby@gmail.com',
        password: 'asd123',
        name: 'ruby11',
        phone: '01011112222',
      });

      expect(savedUser.name).toEqual('ruby');
    });
  });
});
