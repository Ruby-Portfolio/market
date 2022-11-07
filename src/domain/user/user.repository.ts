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
    return !!(await this.userModel.exists({ email }).exec());
  }

  async create(user: User): Promise<User> {
    return await this.userModel.create(user);
  }

  async findById(id: number): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async deleteAll() {
    await this.userModel.deleteMany({}, {}).exec();
  }
}