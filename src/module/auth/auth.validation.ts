import { registerDecorator, ValidationOptions } from '@nestjs/class-validator';
import { AuthErrorMessage } from './auth.message';

export function IsPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message: AuthErrorMessage.INVALID_PASSWORD,
      },
      validator: {
        validate(value: any) {
          const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
}
