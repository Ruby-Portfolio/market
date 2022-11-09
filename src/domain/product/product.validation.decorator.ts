import { registerDecorator, ValidationOptions } from 'class-validator';
import { ProductOrder } from './product.enum';

export function IsProductOrder(
  validationOptions?: ValidationOptions & { nullable?: boolean },
) {
  const isEmpty = (value): boolean => {
    return validationOptions.nullable && !value;
  };

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (isEmpty(value)) {
            return true;
          }

          return Object.values(ProductOrder).includes(value);
        },
      },
    });
  };
}
