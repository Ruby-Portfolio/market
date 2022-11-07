import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ExistsEmailUserException } from './auth.exception';
import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.schema';
import { CreateUserDto } from './auth.request.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signUp({ email, password, name, phone }: CreateUserDto): Promise<User> {
    const existsUser = await this.userRepository.existByEmail(email);

    if (existsUser) {
      throw new ExistsEmailUserException();
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return this.userRepository.create({
      email,
      name,
      phone,
      password: hashedPassword,
    } as User);
  }
}
