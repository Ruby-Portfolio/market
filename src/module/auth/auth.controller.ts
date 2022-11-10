import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './auth.request.dto';
import { AuthenticatedGuard, AuthLocalGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signUp')
  async signUp(@Body() createUser: CreateUserDto): Promise<void> {
    await this.authService.signUp(createUser);
  }

  @UseGuards(AuthLocalGuard)
  @Post('login')
  login(): void {}

  @UseGuards(AuthenticatedGuard)
  @Get('logout')
  logout(@Req() req): void {
    req.session.destroy();
  }
}
