export interface IApiSuccess<T> {
  success: true;
  data: T;
}

export interface IApiError<T = any> {
  success: false;
  connectionLost: boolean;
  error: string;
  details: T;
}

export type IApiResponse<T, Y = any> = IApiSuccess<T> | IApiError<Y>;
