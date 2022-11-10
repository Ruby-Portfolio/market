import { SuccessInterceptor } from '../common/interceptor/success.interceptor';

/**
 * interceptor 적용 설정
 * @param app
 */
export const interceptorConfig = (app) => {
  app.useGlobalPipes(new SuccessInterceptor());
};
