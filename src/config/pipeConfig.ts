import { validationPipe } from '../common/pipe/validation.pipe';

export const pipeConfig = (app) => {
  validationPipe(app);
};
