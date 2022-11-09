import { SuccessInterceptor } from '../common/interceptor/success.interceptor';

export const interceptorConfig = (app) => {
  app.useGlobalPipes(new SuccessInterceptor());
};
