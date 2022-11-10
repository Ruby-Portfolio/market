import { registerDecorator, ValidationOptions } from '@nestjs/class-validator';
import { AuthErrorMessage } from './auth.message';

export const IsPassword: Function = (
  validationOptions?: ValidationOptions,
): Function => {
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message: AuthErrorMessage.INVALID_PASSWORD,
      },
      validator: {
        validate(value: any): boolean | Promise<boolean> {
          const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
};
