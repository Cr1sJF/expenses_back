import { Application } from 'express';
import { v1 } from 'uuid';

export const setContext = (key: string, value: any) => {
  try {
    if (key == 'context') {
      process.env.context = JSON.stringify(value);
    } else {
      if (process.env.context) {
        let context = JSON.parse(process.env.context);
        process.env.context = JSON.stringify({
          ...context,
          [key]: value,
        });
      } else {
        process.env.context = JSON.stringify({
          [key]: value,
        });
      }
    }
  } catch (error) {
    console.error('🔴 Error setContext', error);
  }
};

export const getContext = (key?: string) => {
  try {
    if (process.env.context) {
      let context = JSON.parse(process.env.context);

      if (key) {
        return context[key] || null;
      } else {
        return context || {};
      }
    }

    return null;
  } catch (error) {
    console.error('🔴 Error getContext', error);
    return null;
  }
};

export default async (app: Application) => {
  app.use((req, _, next) => {
    const reqId = v1();

    const ts = req.headers.ts || '';

    setContext('context', {
      reqId,
      ts,
    });

    next();
  });
};
