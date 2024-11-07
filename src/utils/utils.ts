import CryptoJS from 'crypto-js';

import { KeyValueObj, LabelValueObj, NameValueObj } from '../types/General';
import { getConfig } from '../config';

import { IConvertToLabelValueOptions } from '../types/Utils';

//#region ARRAY UTILS

export const convertToLabelValueArray = <T extends Record<string, any>>(
  source: T[],
  lblKey: keyof T,
  valKey: keyof T,
  options: Partial<IConvertToLabelValueOptions> = {}
): LabelValueObj[] => {
  let result: LabelValueObj[] = [];

  if (options.sort) {
    source.sort(function (a: T, b: T) {
      var x = !isNaN(Number(a[lblKey]))
        ? Number(a[lblKey])
        : (a[lblKey] as any);
      var y = !isNaN(Number(b[lblKey]))
        ? Number(b[lblKey])
        : (b[lblKey] as any);
      if (typeof x === 'number' && typeof y === 'number') {
        return x < y ? -1 : x > y ? 1 : 0;
      } else if (typeof x === 'string') {
        return y.toString().localeCompare(x.toString());
      } else {
        return x.toString().localeCompare(y.toString());
      }
    });
  }

  source.forEach((elem: T) => {
    let formatted: LabelValueObj = {
      label: elem[lblKey] as string,
      value: elem[valKey] as string,
    };

    if (options.upper) {
      formatted = {
        label: formatted.label.toString().toUpperCase(),
        value: formatted.value.toString().toUpperCase(),
      };
    }

    result.push(formatted);
  });

  return result;
};

export const convertToNameValueArray = (
  source: KeyValueObj,
  lblKey: string,
  valKey: string,
  options: Partial<IConvertToLabelValueOptions> = {}
) => {
  let result: NameValueObj[] = [];

  if (options.sort) {
    source.sort(function (a: KeyValueObj, b: KeyValueObj) {
      var x = !isNaN(Number(a[lblKey])) ? Number(a[lblKey]) : a[lblKey];
      var y = !isNaN(Number(a[lblKey])) ? Number(b[lblKey]) : b[lblKey];
      if (typeof x == 'number' && typeof y == 'number') {
        return x < y ? -1 : x > y ? 1 : 0;
      } else if (typeof x == 'string') {
        return y.localeCompare(x);
      } else {
        return x.toString().localeCompare(y);
      }
    });
  }

  source.forEach((elem: KeyValueObj) => {
    let formatted: NameValueObj = {
      name: elem[lblKey],
      value: elem[valKey],
    };

    if (options.upper) {
      formatted = {
        name: formatted.name.toString().toUpperCase(),
        value: formatted.value.toString().toUpperCase(),
      };
    }

    result.push(formatted);
  });

  return result;
};

export const sortArrayByKey = (key: string, nullFirst: boolean = false) => {
  return function (a: any, b: any) {
    var x = a[key];
    var y = b[key];

    if (nullFirst && !x) return -1;

    return x < y ? -1 : x > y ? 1 : 0;
  };
};

export const removeDuplicatesByKey = (array: any[], key: string) => {
  const seen = new Map();

  return array.filter((item) => {
    const keyValue = item[key];
    if (!seen.has(keyValue)) {
      seen.set(keyValue, true);
      return true;
    }
    return false;
  });
};

type Element = {
  [key: string]: any;
};

export const groupBy = <T extends Element, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((result, currentValue) => {
    const groupKey = currentValue[key] as unknown as string;
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentValue);
    return result;
  }, {} as Record<string, T[]>);
};

//#endregion

//#region ENCRYPT
export const cryptoJS = {
  encrypt: (val: string) => {
    val = typeof val === 'object' ? JSON.stringify(val) : val;
    let cyptoData = CryptoJS.AES.encrypt(val, getConfig('PASSPHRASE'));
    return cyptoData.toString();
  },
  decrypt: <T = any>(val: string): T => {
    let decrypt = CryptoJS.AES.decrypt(val, getConfig('PASSPHRASE')).toString(
      CryptoJS.enc.Utf8
    );
    try {
      return JSON.parse(decrypt);
    } catch (e) {
      return decrypt as T;
    }
  },
};
//#endregion

export const convertToBase64 = (content: string): string => {
  if (!content) return '';
  return Buffer.from(content).toString('base64');
};

export const transformProp = (
  prop: any,
  avoidParse?: boolean
): Number | string | boolean | null => {
  let result;
  if (avoidParse) {
    return prop;
  }

  if (prop === null || prop === undefined) {
    return prop;
  }
  if (typeof prop === 'boolean') {
    result = prop;
  } else if (!isNaN(Number(prop))) {
    result = Number(prop);
  } else if (prop.toLowerCase() == 'true' || prop.toLowerCase() == 'false') {
    result = prop.toLowerCase() == 'true' ? true : false;
  } else if (typeof prop == 'string') {
    result = prop;
  } else {
    result = prop;
  }

  return result;
};

export const parseProp = <T>(
  prop: any,
  avoidParse?: boolean
): T | Object | Number | string | boolean => {
  let result;
  try {
    result = JSON.parse(prop);

    if (typeof result !== 'object') {
      result = transformProp(prop, avoidParse);
    }
  } catch (error) {
    result = transformProp(prop, avoidParse);
  }

  return result;
};

export const excludePropsFromObject = <T>(
  obj: object,
  props: string[]
): Partial<T> => {
  const filteredObj = Object.entries(obj).reduce((acc, [key, value]) => {
    if (!props.includes(key)) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);

  return filteredObj;
};

export const extractObjectValue = <T = string>(
  json: any,
  keysToExtract: string | string[]
): T | null => {
  // Intenta parsear el JSON stringificado
  let jsonObject;
  try {
    if (typeof json === 'string') {
      jsonObject = JSON.parse(json);
    } else {
      jsonObject = json;
    }

    keysToExtract = !Array.isArray(keysToExtract)
      ? [keysToExtract]
      : keysToExtract;
  } catch (error) {
    console.error('Invalid JSON string:', error);
    return null; // Si el JSON es inválido, devolvemos null
  }

  // Función recursiva para buscar el mensaje
  function findMessage<T = string>(obj: any): T | null {
    // Recorremos todas las claves del objeto
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (keysToExtract.includes(key)) {
          return obj[key];
        }
        // Si el valor es un objeto, llamamos a la función recursivamente
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const foundMessage = findMessage<T>(obj[key]);
          if (foundMessage) {
            return foundMessage; // Si encontramos el mensaje en un nivel más profundo, lo devolvemos
          }
        }
      }
    }
    return null; // Si no encontramos nada, devolvemos null
  }

  return findMessage(jsonObject);
};

export const cooldown = (seconds: number = 1) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};
