import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/user/user.repository';
import { InvalidUserInfoException } from './auth.exception';
import { User } from '../../domain/user/user.schema';
import { Types } from 'mongoose';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(
    email: string,
    pass: string,
  ): Promise<User & { _id: Types.ObjectId }> {
    const findUser = await this.userRepository.findByEmail(email);

    if (!findUser) {
      throw new InvalidUserInfoException();
    }

    const validate = await bcrypt.compare(pass, findUser.password);

    if (!validate) {
      throw new InvalidUserInfoException();
    }

    return findUser;
  }
}
