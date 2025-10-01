import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HaravanUser } from './interface/user.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async getAccessToken(user: HaravanUser): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      {
        userId: user.userId.toString(),
        orgId: user.orgId.toString(),
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    return accessToken;
  }
}
