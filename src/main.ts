import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validationPipe } from './common/pipe/validation.pipe';
import { sessionConfig } from './module/auth/auth.session.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  validationPipe(app);

  sessionConfig(app);

  const port = process.env.PORT;
  await app.listen(port);
}
bootstrap();
