import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from 'axios';

interface IAxiosConfig {
  /**
   * Nombre de la integracion
   */
  serviceName: string;
  /**
   * Base url del servicio
   */
  baseUrl: string;
  /**
   * Token de autorización
   */
  token?: string;

  /**
   * Credenciales de autorización
   */
  //   credentials?: ApiCredentials;

  /**
   * Headers por defecto
   */
  headers?: { [key: string]: string };

  /**
   * Timeout en segundos
   */
  timeout?: number;

  /**
   * Prefijo identificador para logs. Por defecto es 🌐
   */
  prefix?: string;

  /**
   * Campo de la respuesta que determina el exito de la operacion
   */
  successKey: string | string[];
}

interface IRequestOptions {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
  query?: { [key: string]: any };
  body?: any;
  headers?: { [key: string]: any };
  // config?: any;
}

interface IAxiosResponseConstructor<T> {
  data: AxiosError | AxiosResponse<T>;
  serviceName: string;
  prefix: string;
  successKey: string | string[];
}

const getApiUrl = (
  config: AxiosResponse | InternalAxiosRequestConfig
): string => {
  let url;
  if ('config' in config) {
    const data = config.config;
    url = data.baseURL! + data.url!;
  } else {
    const data = config;
    url = data.url!;
  }

  return url;
};

class ApiResponse<T> {
  serviceName: string;
  prefix: string;

  url: string;
  baseUrl: string;
  path: string;
  method: string;

  status: number;

  request: any;
  response!: any;

  duration!: number;

  constructor(constructor: IAxiosResponseConstructor<T>) {
    this.serviceName = constructor.serviceName;
    this.prefix = constructor.prefix;

    this.url =
      constructor.data.config!.baseURL! + constructor.data.config!.url!;
    this.baseUrl = constructor.data.config!.baseURL!;
    this.path = constructor.data.config!.url!;
    this.request = constructor.data.config?.data;
    this.method = constructor.data.config!.method!;

    const isError = constructor.data instanceof AxiosError;

    if (constructor.data instanceof AxiosError) {
      const response = constructor.data;
      if (response.response) {
        this.status = response.response.status;
        this.response = {
          success: false,
          connectionLost: false,
          error: response.message,
          details: response.response.data,
        };
      } else {
        this.status = -1;
        this.response = {
          success: false,
          connectionLost: true,
          error: response.code!,
          details: response.message,
        };
      }
    } else {
      this.status = constructor.data.status!;
      if ('data' in constructor.data) {
        this.response = {
          success: this.status >= 200 && this.status < 300,
          data: constructor.data.data as T,
        };
      }
      // this.duration = new Date().getTime() - data.metadata!.startTime.getTime();
    }

    this.logResponse(isError);
  }

  private logResponse(isError: boolean) {}

  public getResponse() {
    return this.response;
  }
}

export class AxiosHelper {
  private name: string;
  private conector: AxiosInstance;
  private prefix: string;
  successKey: string | string[];

  constructor(data: IAxiosConfig) {
    let options: CreateAxiosDefaults = {
      timeout: (data.timeout || 20) * 1000,
      baseURL: data.baseUrl,
    };

    if (data.token) {
      options.headers = {
        Authorization: `${
          data.token.indexOf('Bearer ') == -1 ? 'Bearer ' : ''
        }${data.token}`,
      };
    }

    this.prefix = data.prefix || '🌐';
    this.conector = axios.create(options);
    this.successKey = data.successKey || 'success';

    this.conector.interceptors.request.use(
      (request: InternalAxiosRequestConfig) => {
        return request;
      }
    );

    this.conector.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (!error.response) {
          error.response = {
            success: false,
            connectionLost: true,
            error: error.code,
            message: error.message,
          };
        }

        return Promise.reject(error);
      }
    );

    this.conector.defaults.transformResponse = (response) => {
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (error) {
        parsedResponse = {
          error: true,
          stringResponse: response,
        };
      }

      return parsedResponse;
    };

    this.name = data.serviceName;
  }

  public async request<T>(config: IRequestOptions): Promise<ApiResponse<T>> {
    try {
      const response = await this.conector.request<T>({
        method: config.method,
        url: config.url,
        params: config.query,
        data: config.body,
        headers: config.headers,
      });

      const result = new ApiResponse<T>({
        data: response,
        serviceName: this.name,
        prefix: this.prefix,
        successKey: this.successKey,
      });
      return result;
    } catch (error) {
      return new ApiResponse<T>({
        data: error as any,
        prefix: this.prefix,
        serviceName: this.name,
        successKey: this.successKey,
      });
    }
  }
}

export default (config: IAxiosConfig): AxiosHelper => {
  const conector = new AxiosHelper(config);

  return conector;
};
