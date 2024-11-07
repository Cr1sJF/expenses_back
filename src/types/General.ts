// import Invoice from "../models/OCC/Invoice";

export type CarType = 'USED' | 'NEW';

export enum SITES {
  BF = 'BF',
  DIFOR = 'DIFOR',
  AUTOLAND_PE = 'AUTOLAND_PE',
}

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

export interface IApiError {
  success: false;
  data: {
    error: string;
    details?: any;
  };
}

export interface IApiError2<T = any> {
  success: false;
  connectionLost?: boolean;
  error: string;
  details: T;
}

export interface IApiStringError {
  sucess: false;
  stringResponse: string;
}

export type IApiResponse<T> = IApiSuccess<T> | IApiError;

export type IApiResponse2<T, Y = any> = IApiSuccess<T> | IApiError2<Y>;

// interface IApiResponse {
// 	status?: number;
// 	success: boolean;
// }

// interface IApiResponseSuccess<T> extends IApiResponse {
// 	success: true;
// 	data: T;
// }

// interface IApiResponseError extends IApiResponse {
// 	success: false;
// 	error: string;
// 	details: KeyValueObj | string | string[] | null | undefined;
// }

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

export enum TransactionTypes {
  APPRAISAL = 'TASACION',
  RESERVE = 'RESERVA',
  TRANSBANK_RESERVE = 'RESERVA_TRANSBANK',
  FULL_PAYMENT = 'FULL_PAYMENT',
  TRANSBANK = 'TRANSBANK',
  MAINTENANCE = 'CHECKOUT_AGENDA',
  FINANCING = 'FINANCIAMIENTO',
}

export interface IControllerResponse<T> {
  status: ResponseCode;
  response: IApiResponse<T> | IValidationStatus;
}

export interface IOrderSubmitProcessResult {
  responseCode: string;
  responseDescription: string;
}

export type MessageProviders = 'SLACK' | 'TEAMS';

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

export interface IClient {
  docNumber: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface IBaseCar {
  plate: string;
  year: number;
  brand: string;
  model: string;
  version?: string;
  versions?: LabelValueObj[];
}
export interface IBaseAppointment {
  id: number;
  branchId: string;
  date: string;
  hour: string;
}

export interface IFindAppointment extends IBaseAppointment {
  office: IBranch;
  id: number;
}

export interface IExternalAppointment extends IBaseAppointment {
  service: string;
}

export type HoursArray = Array<string>;

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

export interface IBranch {
  id: string;
  name: string;
  address: string;
  maps?: string;
  waze?: string;
}

export interface IExternalAppointmentRequest {
  user: IClient;
  appointment: IExternalAppointment;
  car: IBaseCar;
}
