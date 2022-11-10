import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { sessionConfig } from './config/session.config';
import { interceptorConfig } from './config/interceptorConfig';
import { pipeConfig } from './config/pipeConfig';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');

  pipeConfig(app);
  sessionConfig(app);
  interceptorConfig(app);

  const port = process.env.PORT;
  await app.listen(port);
};
bootstrap();
