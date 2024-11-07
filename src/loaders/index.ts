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

        // //@ts-ignore
        // function printRoutes(path, layer) {
        // 	if (layer.route) {
        // 		layer.route.stack.forEach(printRoutes.bind(null, path.concat(split(layer.route.path))));
        // 	} else if (layer.name === "router" && layer.handle.stack) {
        // 		layer.handle.stack.forEach(printRoutes.bind(null, path.concat(split(layer.regexp))));
        // 	} else if (layer.method) {
        // 		console.log(
        // 			"%s /%s",
        // 			layer.method.toUpperCase(),
        // 			path.concat(split(layer.regexp)).filter(Boolean).join("/")
        // 		);
        // 	}
        // }

        // function split(thing:any) {
        // 	if (typeof thing === "string") {
        // 		return thing.split("/");
        // 	} else if (thing.fast_slash) {
        // 		return "";
        // 	} else {
        // 		var match = thing
        // 			.toString()
        // 			.replace("\\/?", "")
        // 			.replace("(?=\\/|$)", "$")
        // 			.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
        // 		return match ? match[1].replace(/\\(.)/g, "$1").split("/") : "<complex:" + thing.toString() + ">";
        // 	}
        // }

        // app._router.stack.forEach(printRoutes.bind(null, []));
      })
      .on('error', (err) => {
        log.error(err);
        process.exit(1);
      });
  } catch (error) {
    log.error(`🚨FATAL ERROR INITIALIZING APP🚨`, error.message);
  }
};
