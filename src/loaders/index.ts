import dotenv from 'dotenv';
dotenv.config();
import { Application } from 'express';
import RoutesLoader from './routes';
import { getConfig } from '../config';
import Logger from '../models/Loggers/Logger';
import cors from './routes/cors';
import context from './routes/context';
import middleware from './routes/middleware';
import BDLoader from './bdConector';
const log = new Logger('INDEX');

export default async (app: Application) => {
  try {
    if (!process.env.NODE_ENV)
      throw new Error('Missing NODE_ENV var in .env file');

    log.info(`🛡️ *** LOADING [${getConfig('INSTANCE')}] ENV ***🛡️`);

    await cors(app);

    await context(app);

    await middleware(app);

    await RoutesLoader(app);

    await BDLoader();

    app
      .listen(process.env.PORT || getConfig('PORT'), () => {
        log.info(
          `🛡️ *** SERVER RUNNING ON PORT ${
            process.env.PORT || getConfig('PORT')
          } ***🛡️ `
        );
      })
      .on('error', (err) => {
        log.error(err);
        process.exit(1);
      });
  } catch (error) {
    log.error(`🚨FATAL ERROR INITIALIZING APP🚨`, error.message);
  }
};
