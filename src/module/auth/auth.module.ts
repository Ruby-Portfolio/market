import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '../../domain/user/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../domain/user/user.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'local', session: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AuthService, UserRepository],
  controllers: [AuthController],
})
export class AuthModule {}
