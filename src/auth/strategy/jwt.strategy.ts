import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';
import { HaravanUser } from 'src/auth/interface/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user: HaravanUser = {
      orgId: payload.orgId,
      userId: payload.userId,
    };
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
