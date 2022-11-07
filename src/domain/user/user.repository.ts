import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async existByEmail(email: string): Promise<boolean> {
    return !!(await this.userModel.exists({ email }));
  }

  async create(user: User): Promise<User> {
    return await this.userModel.create(user);
  }
}
