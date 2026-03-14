import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message = res.message || message;
        details = res.message !== message ? res.message : null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Erro não tratado: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? 'Erro de validação' : message,
      details: Array.isArray(message) ? message : details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
