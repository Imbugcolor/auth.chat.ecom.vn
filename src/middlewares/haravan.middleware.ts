import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class HaravanMiddleware implements NestMiddleware {
  private apiKey: string;
  private toleranceSeconds: number;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HARAVAN_APP_PROXY_KEY', '');
    this.toleranceSeconds = this.configService.get<number>(
      'HARAVAN_TOLERANCE_SECONDS',
      300,
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    const hmacHeader = req.headers['x-haravan-hmacsha256'] as string;
    const timestamp = req.headers['x-haravan-timestamp'] as string;
    if (!hmacHeader || !timestamp)
      // return res.status(401).json({ message: 'Missing HMAC' });
      throw new UnauthorizedException('Missing HMAC');

    const ts = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(ts) || Math.abs(now - ts) > this.toleranceSeconds) {
      // return res.status(401).json({ message: 'Expired timestamp' });
      throw new UnauthorizedException('Expired timestamp');
    }

    const keys = Object.keys(req.headers)
      .filter(
        (k) =>
          k.toLowerCase().startsWith('x-haravan') &&
          k.toLowerCase() !== 'x-haravan-hmacsha256',
      )
      .sort();

    let strBuilder = '';
    for (const k of keys) {
      const v = req.headers[k];
      const val = Array.isArray(v) ? v.join(';') : v || '';
      strBuilder += val + '|';
    }

    const computed = crypto
      .createHmac('sha256', this.apiKey)
      .update(Buffer.from(strBuilder, 'utf8'))
      .digest('base64');

    const bufA = Buffer.from(hmacHeader);
    const bufB = Buffer.from(computed);
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      // return res.status(401).json({ message: 'Invalid HMAC' });
      throw new UnauthorizedException('Invalid HMAC');
    }

    if (
      !req.headers['x-haravan-customer-id'] ||
      !req.headers['x-haravan-org-id']
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    (req as any).haravan_user = {
      orgId: req.headers['x-haravan-org-id'],
      userId: req.headers['x-haravan-customer-id'],
    };

    next();
  }
}
