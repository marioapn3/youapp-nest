import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T | { data: T; metadata?: any }) => {
        const response = context.switchToHttp().getResponse<Response>();
        const hasDataProperty =
          data && typeof data === 'object' && 'data' in data;
        return {
          statusCode: response.statusCode,
          message: 'Success',
          success: true,
          data: hasDataProperty ? (data as { data: T }).data : data,
        };
      }),
    );
  }
}
