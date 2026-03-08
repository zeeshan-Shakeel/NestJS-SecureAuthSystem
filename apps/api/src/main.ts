import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PostgresExceptionFilter } from './filter/postgres-exception.filter.js';
import { AuthGuard } from './auth/auth.guard.js';
import cookieParser from 'cookie-parser'; // NEW: needed to read cookies from requests

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Must be specific URL when credentials: true
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use(cookieParser()); // NEW: enable cookie parsing
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new PostgresExceptionFilter());
  await app.listen(Number(process.env.PORT) || 4000);
}

bootstrap();
