import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PostgresExceptionFilter } from './filter/postgres-exception.filter.js';
import { AuthGuard } from './auth/auth.guard.js';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PostgresExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
