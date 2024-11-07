import { Application } from 'express';
import Log from '../../models/Loggers/Logger';
import { getConfig } from '../../config';
const log = new Log('Swagger');

import swaggerJSDoc, { OAS3Definition, OAS3Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export default (app: Application) => {
  try {
    if (getConfig('INSTANCE') != 'PROD') {
      const docUrl = `${getConfig('HEROKU_URL')}`;

      const servers = [
        {
          url: `http://localhost:${getConfig('PORT')}`,
          description: `LOCALHOST - ${getConfig('INSTANCE')}`,
        },
      ];

      const swaggerDefinition: OAS3Definition = {
        openapi: '3.0.0',
        info: {
          title: 'Bruno Fritsch API',
          version: '1.0.0',
        },
        externalDocs: {
          url: `${docUrl}/api/v1/docs.json`,
          description: 'JSON Definition',
        },
        security: [
          {
            External: [],
          },
        ],
        servers: servers,
        components: {
          schemas: {
            // success: {
            // 	type: "object",
            // 	required: ["success"],
            // 	properties: {
            // 		success: {
            // 			type: "boolean",
            // 			example: "true",
            // 		},
            // 		data: {
            // 			type: {
            // 				oneOf: [
            // 					"string",
            // 					"object"
            // 				]
            // 			}
            // 		},
            // 	},
            // },
            invalid: {
              type: 'object',
              required: ['valid', 'errors'],
              properties: {
                valid: {
                  type: 'boolean',
                  example: 'false',
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  example: ['param is invalid', 'year must be > 0'],
                },
                template: {
                  type: 'object',
                  optional: true,
                  description: 'Plantilla del parámetro',
                },
              },
            },
            error: {
              type: 'object',
              required: ['success'],
              properties: {
                success: {
                  type: 'boolean',
                  example: 'false',
                },
                data: {
                  error: {
                    type: 'string',
                  },
                  details: {
                    type: 'string',
                  },
                },
              },
            },
            labelValue: {
              type: 'object',
              properties: {
                label: {
                  type: 'string',
                },
                value: {
                  type: 'string',
                },
              },
            },
          },
        },
      };

      const swaggerOptions: OAS3Options = {
        swaggerDefinition,
        apis: [
          './src/controllers/**/*.yaml',
          './src/controllers/**/*.ts',
          './src/controllers/**/*.json',
        ],
      };

      const openapiSpecification = swaggerJSDoc(swaggerOptions);

      // Route to visit our docs
      app.use(
        '/api/v1/docs',
        swaggerUi.serve,
        swaggerUi.setup(openapiSpecification)
      );
      app.use('/api/v1/docs.json', (_, res) => {
        res.send(openapiSpecification);
      });
      log.log(`Docs V1 available on ${docUrl}/api/v1/docs`);

      log.log(`Docs V1 JSON available on ${docUrl}/api/v1/docs.json`);
    } else {
      log.warn('📓 Docs unavailable in PROD');
    }
  } catch (error) {
    log.error('Error configurando Swagger', error);
  }
};
