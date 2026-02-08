import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

@Catch()
export class PostgresExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Log the exception to help debug why it's falling through
    console.error('Exception caught by filter:', exception);

    // Check if it's a NestJS HttpException (using safer check)
    if (exception && typeof exception.getStatus === 'function' && typeof exception.getResponse === 'function') {
      return response.status(exception.getStatus()).json(exception.getResponse());
    }

    // Duplicate key (unique constraint)
    if (exception?.code === '23505') {
      return response.status(409).json({
        statusCode: 409,
        message: 'User with this email already exists',
      });
    }

    // Other DB / unknown errors
    return response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',

    });
  }
}
