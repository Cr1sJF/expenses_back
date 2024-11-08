import dotenv from 'dotenv';
import * as CONSTANTS from './constants/CONSTANTS.json';
// TODO: Autoland es un duplicado de DIFOR para mantener tipado

// Solo cargar el archivo .env en desarrollo o pruebas
if (process.env.NODE_ENV !== 'production') {
  const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
  dotenv.config({ path: envFile });
}

const log = console;

export interface Config {
  NODE_ENV: string;
  PORT: string;
  INSTANCE: string;
  HEROKU_URL: string;
  DB_TOKEN: string;
  APIS: string;
  DB_INSERT: string;
  DB_UPDATE: string;
  DB_DELETE: string;
  PASSPHRASE: string;
}

export const getConstant = <T = string>(
  name: keyof typeof CONSTANTS
): T | null => {
  return (CONSTANTS[name] as T) || null;
};

const parseConfig = <T = string>(config: string): T => {
  let result;
  try {
    result = JSON.parse(config);
  } catch (error) {
    if (!isNaN(Number(config))) {
      result = Number(config);
    } else if (config == 'true' || config == 'false') {
      result = config == 'true' ? true : false;
    } else if (typeof config == 'boolean' || typeof config == 'string') {
      result = config;
    }
  }

  return result;
};

export const getConfig = <T = string>(key: keyof Config): T => {
  try {
    if (process.env[key]) {
      return parseConfig(process.env[key] || '');
    } else if (process.env[key]) {
      return parseConfig(process.env[key] || '');
    } else {
      log.warn('Config not found: ' + key);
      return '' as T;
    }
  } catch (error) {
    log.error(`Error getting config: ${key}`, error);

    return '' as T;
  }
};

export const getArrayConfig = <T = string>(
  key: keyof Config,
  upper: boolean = false
): T[] => {
  try {
    let value: any;
    if (process.env[key]) {
      value = process.env[key] || '';
    } else if (process.env[key]) {
      value = process.env[key];
    } else {
      log.warn('Config not found: ' + key);
      value = '';
    }

    return value
      .split(';')
      .map((item: any) =>
        upper ? parseConfig(item).toUpperCase() : parseConfig(item)
      );
  } catch (error) {
    log.error('Error getting array config: ' + key, error);

    return [];
  }
};
