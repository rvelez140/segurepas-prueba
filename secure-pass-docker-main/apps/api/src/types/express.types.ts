import { IUser } from '../interfaces/IUser';
import { ISubscription } from '../interfaces/ISubscription';

type PlainObject = Record<string, any>;

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
    subscription?: ISubscription;
  }
}

export const flattenObject = (
  obj: PlainObject,
  prefix = '',
  result: PlainObject = {}
): PlainObject => {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      flattenObject(value, path, result);
    } else {
      result[path] = value;
    }
  }

  return result;
};
