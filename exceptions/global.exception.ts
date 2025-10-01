import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    response.status(status).json({
      statusCode: status,
      success: false,
      message:
        errorResponse && (errorResponse as any).message
          ? (errorResponse as any).message
          : (exception as any).message || 'Internal server error',
    });
  }
}
