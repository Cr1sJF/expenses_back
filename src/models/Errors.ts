import {
  ERROR_TYPES,
  IApiError as IApiError,
  ResponseCode,
} from '../types/General';

export class ProviderError extends Error {
  code: number;
  data: any;
  msg: string;
  constructor(
    message: string,
    code: number = ResponseCode.NOT_IMPLEMENTED,
    data?: any
  ) {
    super(message);
    this.name = ERROR_TYPES.PROVIDER;
    this.code = code;
    this.msg = message;
    this.stack = '';

    this.message = message;
    if (data) {
      this.data = data;
    }
  }
}

export class IntegrationError extends Error {
  code: number;
  details: any;
  constructor(
    message: string,
    details: any,
    code: number = ResponseCode.ERROR
  ) {
    super(message);
    this.name = ERROR_TYPES.INTEGRATION;
    this.code = code;
    this.details = details;
  }
}

export class RequestError<T = any> extends Error {
  status: number;
  response: IApiError<T>;
  constructor(
    message: string,
    response: IApiError<T>,
    code: number = ResponseCode.ERROR
  ) {
    super(message);
    this.name = ERROR_TYPES.INTEGRATION;
    this.response = response;
    this.status = code;
  }
}
