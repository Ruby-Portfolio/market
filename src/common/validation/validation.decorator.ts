import { registerDecorator, ValidationOptions } from 'class-validator';
import { Country } from '../../domain/common/enums/country';
import { Category } from '../../domain/common/enums/category';

/**
 * Id 검증 Validator
 * @param validationOptions
 */
export function IsId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return value && typeof value === 'string';
        },
      },
    });
  };
}

/**
 * 빈 공백이 아닌 문자열 검증 Validator
 * @param validationOptions
 */
export function IsNotBlankString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotBlankString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          return !!value.replace(/ /g, '');
        },
      },
    });
  };
}

/**
 * 날짜 형식의 문자열 검증 Validator
 * @param validationOptions
 */
export function IsLocalDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isLocalDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
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
}

/**
 * 국가 값 검증 Validator
 * @param validationOptions
 */
export function IsCountry(
  validationOptions?: ValidationOptions & { nullable?: boolean },
) {
  const isEmpty = (value): boolean => {
    return validationOptions.nullable && !value;
  };

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCountry',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (isEmpty(value)) {
            return true;
          }

          return Object.values(Country).includes(value);
        },
      },
    });
  };
}

/**
 * 카테고리 값 검증 Validator
 * @param validationOptions
 */
export function IsCategory(
  validationOptions?: ValidationOptions & { nullable?: boolean },
) {
  const isEmpty = (value): boolean => {
    return validationOptions.nullable && !value;
  };

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCategory',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (isEmpty(value)) {
            return true;
          }

          return Object.values(Category).includes(value);
        },
      },
    });
  };
}

/**
 * 페이지 번호 값 검증 Validator
 * @param validationOptions
 */
export function IsPage(
  validationOptions?: ValidationOptions & { nullable?: boolean },
) {
  const isEmpty = (value): boolean => {
    return validationOptions.nullable && !value && value !== 0;
  };

  const isNumber = (value): boolean => {
    return typeof value === 'number' && !isNaN(value) && value > 0;
  };
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPage',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (isEmpty(value)) {
            return true;
          }

          return isNumber(value);
        },
      },
    });
  };
}
