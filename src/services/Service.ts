// import httpContext from "express-http-context";
import Joi, { ValidationResult } from 'joi';
import Log from '../models/Loggers/Logger';
import {
  IControllerResponse,
  IProviderResponse,
  IValidationStatus,
  ResponseCode,
} from '../types/General';
import { ParamsList, ServiceConstructor } from '../types/Service';
import { getContext } from '../loaders/routes/context';

const extractObjectStructure = (
  keys: Joi.Description
): { [key: string]: string | Joi.Description } => {
  const result: { [key: string]: string | Joi.Description } = {};

  for (const key in keys) {
    if (keys.hasOwnProperty(key)) {
      const propSchema = keys[key];
      const { type, flags, keys: nestedKeys } = propSchema;

      if (type === 'object' && nestedKeys) {
        result[key] = extractObjectStructure(nestedKeys);
      } else if (type === 'array' && nestedKeys) {
        const [itemSchema] = nestedKeys;
        if (itemSchema.type === 'object') {
          result[key] = [extractObjectStructure(nestedKeys)];
        } else {
          result[key] = [itemSchema.type || itemSchema];
        }
      } else {
        result[key] = `${type} ${
          flags?.presence ? '[' + flags?.presence + ']' : ''
        }`; // type || flags?.presence || "";
      }
    }
  }

  return result;
};
export class Service {
  log: Log;
  flowId: string;
  constructor(data: ServiceConstructor) {
    this.log = new Log(data.logName);
    this.flowId = getContext('flowId') || data.flowId;
    this.log.setFlowId(this.flowId);
  }
  public validateSchema(validator: Joi.ObjectSchema): IValidationStatus {
    const { error }: ValidationResult = validator.validate(this, {
      abortEarly: false,
    });
    if (error) {
      // Obtener la estructura del objeto esperado
      const objectStructure = extractObjectStructure(validator.describe().keys);

      return {
        valid: false,
        errors: error.details.map((detail) => detail.message),
        template: objectStructure,
      };
    }
    return {
      valid: true,
      errors: [],
    };
  }

  public static validateStaticParam(
    validator: Joi.Schema,
    payload: unknown,
    forcedMessage?: string
  ): IValidationStatus {
    const { error }: ValidationResult = validator.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      // Obtener la estructura del objeto esperado
      const objectStructure = extractObjectStructure(validator.describe().keys);

      return {
        valid: false,
        errors: forcedMessage
          ? [forcedMessage]
          : error.details.map((detail) => detail.message),
        template:
          Object.keys(objectStructure).length > 0 ? objectStructure : undefined,
      };
    }
    return {
      valid: true,
      errors: [],
    };
  }

  public static validateStaticParams(params: ParamsList[]): IValidationStatus {
    let errors = [] as string[];
    let templates: string[] | Joi.Description = [];
    params.forEach((i) => {
      const { error }: ValidationResult = i.validator.validate(i.value, {
        abortEarly: false,
      });
      if (error) {
        const objectStructure = extractObjectStructure(
          i.validator.describe().keys
        );
        errors = errors.concat(
          i.forcedMessage
            ? [i.forcedMessage]
            : error.details.map((detail) =>
                detail.message.replace('value', i.name)
              )
        );
        if (Object.keys(objectStructure).length > 0) {
          templates.push(objectStructure);
        }
      }
    });

    return {
      valid: !errors.length,
      errors: errors,
      template: templates,
    };
  }

  protected validateParams(params: ParamsList[]): IValidationStatus {
    let errors = [] as string[];
    let templates: string[] | Joi.Description = [];
    params.forEach((i) => {
      const { error }: ValidationResult = i.validator.validate(i.value, {
        abortEarly: false,
      });
      if (error) {
        const objectStructure = extractObjectStructure(
          i.validator.describe().keys
        );
        errors = errors.concat(
          i.forcedMessage
            ? [i.forcedMessage]
            : error.details.map((detail) =>
                detail.message.replace('value', i.name)
              )
        );
        if (Object.keys(objectStructure).length > 0) {
          templates.push(objectStructure);
        }
      }
    });

    return {
      valid: !errors.length,
      errors: errors,
      template: templates,
    };
  }

  public getSite() {
    return getContext('site');
  }

  public static getSite() {
    return getContext('site');
  }

  protected parseResult<T>(
    data: IProviderResponse<T>,
    nullErrorMsg?: string,
    nullErrorDesc?: any
  ): IControllerResponse<T> {
    if (!data) {
      if (nullErrorMsg) {
        return {
          status: ResponseCode.ERROR,
          response: {
            success: false,
            error: nullErrorMsg,
            details: nullErrorDesc,
          },
        };
      } else {
        return {
          status: ResponseCode.SUCCESS,
          response: {
            success: true,
            //@ts-ignore
            data: null,
          },
        };
      }
    } else if (typeof data == 'object' && 'valid' in data) {
      return {
        status: ResponseCode.INVALID,
        response: data,
      };
    } else if (typeof data == 'object' && 'success' in data) {
      return {
        status: data.success ? ResponseCode.SUCCESS : ResponseCode.ERROR,
        //@ts-ignore
        response: data,
      };
    } else {
      return {
        status: ResponseCode.SUCCESS,
        response: {
          success: true,
          data: data,
        },
      };
    }
  }

  protected parseToControllerResponse<T>(
    data: T | null,
    errorMessage?: string,
    errorIfNull: boolean = true
  ): IControllerResponse<T> {
    if (!data && errorIfNull) {
      return {
        status: ResponseCode.ERROR,
        response: {
          success: false,
          error: errorMessage || 'Error',
          details: errorIfNull,
        },
      };
    } else {
      return {
        status: ResponseCode.SUCCESS,
        response: {
          success: true,
          data: data as T,
        },
      };
    }
  }
}
