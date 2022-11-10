import { validationPipe } from '../../src/common/pipe/validation.pipe';
import { sessionConfig } from '../../src/config/session.config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { TestingModule } from '@nestjs/testing';

export const testApp = (module: TestingModule) => {
  const app: NestFastifyApplication = module.createNestApplication();
  app.setGlobalPrefix('/api');
  validationPipe(app);
  sessionConfig(app);
  return app;
};
