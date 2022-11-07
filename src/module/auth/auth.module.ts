import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'local', session: true }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
