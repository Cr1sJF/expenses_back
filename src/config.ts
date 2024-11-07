import dotenv from 'dotenv';
import { getContext, setContext } from './loaders/routes/context';
import { SITES } from './types/General';
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
  AS_URL: string;
  AS_USER: string;
  AS_PASSWORD: string;
  AS_USER_CONSULTAS: string;
  AS_TOKEN_USED: string;
  AS_TOKEN_NEW: string;
  AP_URL: string;
  AP_TOKEN: string;
  SP_URL: string;
  SP_USER: string;
  SP_PASSWORD: string;
  ZD_URL: string;
  ZD_TOKEN: string;
  ZD_ACTIVE: string;
  OCC_URL_ADMIN: string;
  OCC_URL_STORE: string;
  OCC_TOKEN: string;
  YT_URL: string;
  YT_TOKEN: string;
  RSYS_URL: string;
  RSYS_USER: string;
  RSYS_PASSWORD: string;
  FORUM_URL: string;
  FORUM_LOGIN: string;
  FORUM_PASSWORD: string;
  FORUM_PARTNER: string;
  SLACK_TOKEN: string;
  SLACK_CHANNEL_ERROR: string;
  SLACK_CHANNEL_RESERVAS: string;
  SLACK_CHANNEL_FINANCIAMIENTOS: string;
  SLACK_CHANNEL_ERRORESFORUM: string;
  SLACK_CHANNEL_HEALTH_CHECK: string;
  SLACK_CHANNEL_INCONSISTENTS: string;
  SLACK_CHANNEL_LEADS: string;
  SLACK_CHANNEL_RABBIT_ERRORS: string;
  TB_USER: string;
  TB_KEY: string;
  EMAIL_RESERVE_STARTED: string;
  EMAIL_RESERVE_CONFIRMED: string;
  EMAIL_SERVICES_PROCESSED: string;
  EMAIL_APPRAISAL_CONFIRMED: string;
  EMAIL_RETIRO_SUCURSAL: string;
  EMAIL_FINANCING: string;
  EMAIL_AS_ERROR: string;
  EMAIL_SOLVER_COMPLETED: string;
  EMAIL_EXTERNAL_QUOTE: string;
  DB_INSERT: boolean;
  DB_UPDATE: boolean;
  DB_DELETE: boolean;
  APIS: string;
  SITE_BF: string;
  SITE_DIFOR: string;
  SITE_AUTOLAND_PE: string;
  PASSPHRASE: string;
  RABBIT_ENABLED: boolean;
  RABBIT: string;

  OCC_DEV_ADMIN: string;
  OCC_DEV_TOKEN: string;
  OCC_TEST_ADMIN: string;
  OCC_TEST_TOKEN: string;
  OCC_PROD_ADMIN: string;
  OCC_PROD_TOKEN: string;
  ROOT_COLLECTION: string;

  BREVO_TOKEN: string;
}

export const getSite = (): SITES => {
  const context = getContext('site');
  switch (context) {
    case process.env.SITE_BF:
      return SITES.BF;
    case process.env.SITE_DIFOR:
      return SITES.DIFOR;
    case process.env.SITE_AUTOLAND_PE:
      return SITES.AUTOLAND_PE;
    default:
      return SITES.BF;
  }
};
export const getSiteId = () => {
  const siteId = getContext('site');
  return siteId;
};

export const getConstant = <T = string>(
  name: keyof typeof CONSTANTS
): T | null => {
  return (CONSTANTS[name] as T) || null;
};
export const setSite = (site: string, type: 'id' | 'name') => {
  if (type == 'id') {
    setContext('site', site);
  } else {
    if (site == 'BF') {
      setContext('site', process.env.SITE_BF);
    } else if (site == 'DIFOR') {
      setContext('site', process.env.SITE_DIFOR);
    } else if (site == 'AUTOLAND_PE') {
      setContext('site', process.env.SITE_AUTOLAND);
    }
  }
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

export const getConfig = <T = string>(key: keyof Config, site?: SITES): T => {
  try {
    const context = site || getSite();
    if (process.env[context + '_' + key]) {
      return parseConfig(process.env[context + '_' + key] || '');
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
    const context = getSite();
    let value: any;
    if (process.env[context + '_' + key]) {
      value = process.env[context + '_' + key] || '';
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

export const getOccCredentials = (
  env?: 'DEV' | 'TEST' | 'PROD'
): { url: string; token: string } => {
  if (env) {
    return {
      url: getConfig(`OCC_${env}_ADMIN`),
      token: getConfig(`OCC_${env}_TOKEN`),
    };
  } else {
    return {
      url: getConfig('OCC_URL_ADMIN'),
      token: getConfig('OCC_TOKEN'),
    };
  }
};
