import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async existByEmail(email: string): Promise<boolean> {
    return !!(await this.userModel.exists({ email }).exec());
  }

  async create(user: User): Promise<User & { _id: Types.ObjectId }> {
    return await this.userModel.create(user);
  }

  async findByEmail(email: string): Promise<User & { _id: Types.ObjectId }> {
    return this.userModel.findOne({ email });
  }

  async deleteAll(): Promise<void> {
    await this.userModel.deleteMany({}, {}).exec();
  }
}
