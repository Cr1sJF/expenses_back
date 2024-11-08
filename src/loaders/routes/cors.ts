import cors from 'cors';
import { Application } from 'express';

// const EXCLUDED_APIS: string[] = [];

// const ALLOWED_ORIGINS: string[] = [];
export default async (app: Application) => {
  app.options('*', cors());

  //   app.use((req, res, next) => {
  //     const path = req.path.toUpperCase();
  //     const origin = req.get('origin') || req.hostname;

  //     let excluded_api;

  //     if (path === '/') excluded_api = true;
  //     else {
  //       excluded_api = EXCLUDED_APIS.some(
  //         (api) => path.indexOf(api.toUpperCase()) != -1
  //       );
  //     }

  //     const excluded_origin = ALLOWED_ORIGINS.includes(origin.toLowerCase());

  //     if (excluded_api || excluded_origin) {
  //       next();
  //     } else {
  //       res.status(401).send('NOT ALLOWED');
  //     }
  //   });

  //   app.use(cors());
};
