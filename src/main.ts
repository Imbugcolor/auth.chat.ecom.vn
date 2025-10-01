import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalExceptionFilter } from './exceptions/global.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật versioning
  app.enableVersioning({
    type: VersioningType.URI, // có thể chọn HEADER hoặc MEDIA_TYPE
    defaultVersion: '1',
  });

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const configService = app.get(ConfigService);

  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
