import { registerDecorator, ValidationOptions } from 'class-validator';
import { Country } from '../../domain/common/enums/country';
import { Category } from '../../domain/common/enums/category';

/**
 * Id 검증 Validator
 * @param validationOptions
 */
export const IsId: Function = (
  validationOptions?: ValidationOptions,
): Function => {
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean | Promise<boolean> {
          return value && typeof value === 'string';
        },
      },
    });
  };
};

/**
 * 빈 공백이 아닌 문자열 검증 Validator
 * @param validationOptions
 */
export const IsNotBlankString: Function = (
  validationOptions?: ValidationOptions,
): Function => {
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isNotBlankString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean | Promise<boolean> {
          if (typeof value !== 'string') {
            return false;
          }

          return !!value.replace(/ /g, '');
        },
      },
    });
  };
};

/**
 * 날짜 형식의 문자열 검증 Validator
 * @param validationOptions
 */
export const IsLocalDate: Function = (
  validationOptions?: ValidationOptions,
): Function => {
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isLocalDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean | Promise<boolean> {
          if (typeof value !== 'string') {
            return false;
          }
          const regex = new RegExp(
            /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d)$/,
          );

          return regex.test(value);
        },
      },
    });
  };
};

/**
 * 국가 값 검증 Validator
 * @param validationOptions
 */
export const IsCountry: Function = (
  validationOptions?: ValidationOptions & { nullable?: boolean },
): Function => {
  const isEmpty: Function = (value): boolean => {
    return validationOptions.nullable && !value;
  };

  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isCountry',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean | Promise<boolean> {
          if (isEmpty(value)) {
            return true;
          }

          return Object.values(Country).includes(value);
        },
      },
    });
  };
};

/**
 * 카테고리 값 검증 Validator
 * @param validationOptions
 */
export const IsCategory: Function = (
  validationOptions?: ValidationOptions & { nullable?: boolean },
): Function => {
  const isEmpty: Function = (value): boolean => {
    return validationOptions.nullable && !value;
  };

  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isCategory',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean | Promise<boolean> {
          if (isEmpty(value)) {
            return true;
          }

          return Object.values(Category).includes(value);
        },
      },
    });
  };
};

/**
 * 페이지 번호 값 검증 Validator
 * @param validationOptions
 */
export const IsPage = (
  validationOptions?: ValidationOptions & { nullable?: boolean },
): Function => {
  const isEmpty: Function = (value): boolean => {
    return validationOptions.nullable && !value && value !== 0;
  };

  const isNumber: Function = (value): boolean => {
    return typeof value === 'number' && !isNaN(value) && value > 0;
  };
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isPage',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean | Promise<boolean> {
          if (isEmpty(value)) {
            return true;
          }

          return isNumber(value);
        },
      },
    });
  };
};
