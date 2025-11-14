import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }));

  // ✅ Enable CORS for your Angular app
  app.enableCors({
    origin: 'http://localhost:4200', // your Angular app's URL
    credentials: true,               // allow cookies/auth headers if needed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    exposedHeaders: 'Content-Disposition',
    maxAge: 86400, // Accept preflight OPTIONS request for 1 day
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
