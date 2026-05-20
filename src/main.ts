import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CivicPath API')
    .setDescription('The CivicPath API description')
    .setVersion('1.0')
    .addTag('assembly-constituencies')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Enable graceful shutdown hooks for zero-downtime reloads
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);

  // Send ready signal to PM2 for zero-downtime deployments
  if (process.send) {
    process.send('ready');
  }
}
bootstrap();
