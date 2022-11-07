import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './auth.request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  async signUp(@Body() createUser: CreateUserDto, @Res() res): Promise<void> {
    await this.authService.signUp(createUser);
    res.status(HttpStatus.CREATED);
  }
}
