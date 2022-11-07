import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from '../../domain/user/user.schema';
import { Types } from 'mongoose';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  /**
   * 로그인 요청 성공시 사용자의 정보를 세션에 저장
   * @param user 로그인 요청에 성공한 유저 정보
   * @param done
   */
  serializeUser(
    user: User & { _id: Types.ObjectId },
    done: (err, user: User & { _id: Types.ObjectId }) => void,
  ): void {
    done(null, user);
  }

  /**
   * 세션에 저장된 유저 정보를 반환
   * @param user 세션에 저장된 유저 정보
   * @param done
   */
  async deserializeUser(
    user: User & { _id: Types.ObjectId },
    done: (err, user: User & { _id: Types.ObjectId }) => void,
  ): Promise<void> {
    done(null, user);
  }
}
