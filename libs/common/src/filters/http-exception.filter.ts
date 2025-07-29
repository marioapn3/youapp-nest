import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let error: string | null = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as ExceptionResponse;
      const responseMessage = responseObj.message;
      if (Array.isArray(responseMessage)) {
        message = responseMessage.join(', ');
      } else {
        message = responseMessage || 'Internal server error';
      }
      // Handle custom error messages
      if (responseObj.error) {
        error = responseObj.error;
      }
    } else {
      message = 'Internal server error';
    }

    const errorResponse: ApiResponse<null> = {
      statusCode: status,
      success: false,
      message: message,
      data: null,
      error: error,
    };

    response.status(status).json(errorResponse);
  }
}
