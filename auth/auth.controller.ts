import { Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HaravanUser } from './interface/user.interface';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('access_token')
  async getToken(@Req() req: Request) {
    const user: HaravanUser = (req as any).haravan_user;
    const accessToken = await this.authService.getAccessToken(user);
    return { accessToken };
  }
}
