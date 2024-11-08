export enum ERROR_TYPES {
  PROVIDER = 'PROVIDER',
  INTEGRATION = 'INTEGRATION',
}
export interface SubProcessResponse<T> {
  success: boolean;
  critical: boolean;
  message?: string;
  data?: T;
}

export interface IProcessResponse {
  success: boolean;
  message?: string;
}

export interface IApiSuccess<T> {
  success: true;
  data: T;
}

export interface IApiError<T = any> {
  success: false;
  connectionLost?: boolean;
  error: string;
  details: T;
}

export interface IApiStringError {
  sucess: false;
  stringResponse: string;
}

export type IApiResponse<T, Y = any> = IApiSuccess<T> | IApiError<Y>;

export type IProviderResponse<T> =
  | IApiResponse<T>
  | IValidationStatus
  | IProcessResponse;

export interface IValidationStatus {
  valid: boolean;
  errors: string[];
  data?: {
    html?: string;
  };
  template?: ITemplateValidation | string[];
}

export enum ResponseCode {
  SUCCESS = 200,
  INVALID = 400,
  ERROR = 500,
  NOT_FOUND = 404,
  NOT_IMPLEMENTED = 501,
}

export interface IControllerResponse<T> {
  status: ResponseCode;
  response: IApiResponse<T> | IValidationStatus;
}

export interface IOrderSubmitProcessResult {
  responseCode: string;
  responseDescription: string;
}

export interface KeyValueObj {
  [key: string]: any;
}

export interface LabelValueObj {
  value: number | string;
  label: string;
}
export interface NameValueObj {
  value: number | string;
  name: string;
}

export interface ITemplateValidation {
  [key: string]: string | ITemplateValidation;
}

export interface IInvoicePaymentProcessResult {
  success: boolean;
  code: string;
  description: string;

  customProps?: KeyValueObj;
}

export interface IFormatValidator {
  format: string;
  regex: string | RegExp;
}
