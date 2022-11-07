import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.schema';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  /**
   * 로그인 요청 성공시 사용자의 정보를 세션에 저장
   * @param user 로그인 요청에 성공한 유저 정보
   * @param done
   */
  serializeUser(user: User, done: (err, user: User) => void): void {
    // 유저 정보를 세션에 저장
    done(null, user);
  }

  /**
   * 세션에 저장된 유저 정보를 반환
   * @param user 세션에 저장된 유저 정보
   * @param done
   */
  async deserializeUser(
    user: User,
    done: (err, user: User) => void,
  ): Promise<void> {
    // 세션에 저장되어 있는 유저 정보가 올바른 정보인지 확인
    const userInfo = await this.userRepository.findById(user.id);

    // 세션에 유저 정보가 있다면 request.user 에 유저 정보를 추가
    return done(null, userInfo);
  }
}
