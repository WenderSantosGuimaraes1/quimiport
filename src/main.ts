import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const porta = app.get(ConfigService).get<number>('PORT', 3000);
  await app.listen(porta);
}

void bootstrap();