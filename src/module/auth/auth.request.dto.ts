import { PickType } from '@nestjs/swagger';
import { User } from '../../domain/user/user.schema';
import { IsPassword } from './auth.validation';

export class CreateUserDto extends PickType(User, ['email', 'name', 'phone']) {
  @IsPassword()
  password: string;
}
