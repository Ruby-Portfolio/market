import { registerDecorator, ValidationOptions } from 'class-validator';
import { ProductOrder } from './product.enum';

export const IsProductOrder: Function = (
  validationOptions?: ValidationOptions & { nullable?: boolean },
): Function => {
  const isEmpty: Function = (value): boolean => {
    return validationOptions.nullable && !value;
  };

  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean | Promise<boolean> {
          if (isEmpty(value)) {
            return true;
          }

          return Object.values(ProductOrder).includes(value);
        },
      },
    });
  };
};
