import axios, {
	AxiosError,
	AxiosInstance,
	AxiosResponse,
	CreateAxiosDefaults,
	InternalAxiosRequestConfig,
} from "axios";
import { getArrayConfig } from "../config";
import AxiosLogger from "../models/Loggers/AxiosV2";
import { ApiCredentials, AxiosResponseLogV2 } from "../types/Axios";
import { IApiResponse as IApiResponse, IApiStringError, IApiSuccess, KeyValueObj } from "../types/General";
import { extractObjectValue } from "./utils";
import { RequestError } from "../models/Errors";
import dayjs, { Dayjs } from "./dayJs";
const log = new AxiosLogger("AXIOS");

interface ITokenConfig {
	expiration?: number;
	expirationKey?: string;
	key?: string;
	format: "m" | "s" | "ms";
	prefix?: string;
}

interface ILogginConfig {
	url: string;
	method?: "post" | "get";
	queryParams?: KeyValueObj;
	body?: any;
	headers?: KeyValueObj;
}

interface IRefreshConfig extends ILogginConfig {
	usesCurrentToken?: boolean;
}

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
	credentials?: ApiCredentials;

	/**
	 * Headers por defecto
	 */
	headers?: KeyValueObj;

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
	successKey?: string | string[];

	/**
	 * Campo de la respuesta que determina el exito de la operacion
	 */
	successValidator?: (response: any) => boolean;

	/**
	 * Configuracion para loguearse en la integracion
	 */

	login?: ILogginConfig;

	/**
	 * Configuracion para loguearse en la integracion
	 */

	refresh?: IRefreshConfig;

	/**
	 * Configuracion de token
	 */

	tokenConfig?: ITokenConfig;
}

export interface IRequestOptions {
	method?: "get" | "post" | "put" | "delete";
	url: string;
	query?: KeyValueObj;
	body?: any;
	headers?: KeyValueObj;
	timeout?: number;
	// config?: any;
}

interface IAxiosResponseConstructor<T> {
	data: AxiosError | AxiosResponse<T | IApiStringError>;
	serviceName: string;
	prefix: string;
	successKey?: string | string[];
}

const LOG_APIS: string[] = getArrayConfig("APIS", true);
const getApiUrl = (config: AxiosResponse | InternalAxiosRequestConfig): string => {
	let url;
	if ("config" in config) {
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
	response!: IApiResponse<T>;

	duration!: string;

	constructor(constructor: IAxiosResponseConstructor<T>) {
		this.serviceName = constructor.serviceName;
		this.prefix = constructor.prefix;

		this.url = constructor.data.config!.baseURL! + constructor.data.config!.url!;
		this.baseUrl = constructor.data.config!.baseURL!;
		this.path = constructor.data.config!.url!;
		this.request = constructor.data.config?.data;
		this.method = constructor.data.config!.method!;

		const isError = constructor.data instanceof AxiosError;

		if (constructor.data instanceof AxiosError) {
			const response = constructor.data;
			this.duration = this.formatTime(new Date().getTime() - response.config!.metadata!.startTime.getTime());
			if (response.response) {
				this.status = response.response.status;
				this.response = {
					success: false,
					connectionLost: false,
					error: extractObjectValue(response.response.data, ["message", "mensaje"]) || response.message,
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
			if ("data" in constructor.data) {
				this.duration = this.formatTime(
					new Date().getTime() - constructor.data.config!.metadata!.startTime.getTime()
				);

				const success =
					extractObjectValue<boolean>(constructor.data.data, constructor.successKey || "success") != undefined
						? extractObjectValue<boolean>(constructor.data.data, constructor.successKey || "success")
						: this.status >= 200 && this.status < 300;

				if (success) {
					this.response = {
						success: true,
						data: constructor.data.data as T,
					};
				} else {
					this.response = {
						success: false,
						error: "Response error",
						details: constructor.data.data,
					};
				}
			}
			// this.duration = new Date().getTime() - data.metadata!.startTime.getTime();
		}

		this.logResponse(isError);
	}

	private formatTime(ms: number): string {
		const hours = Math.floor(ms / 3600000);
		ms %= 3600000;
		const minutes = Math.floor(ms / 60000);
		ms %= 60000;
		const seconds = Math.floor(ms / 1000);
		const milliseconds = ms % 1000;

		let result = "";

		if (hours > 0) result += `${hours}h `;
		if (minutes > 0) result += `${minutes}m `;
		if (seconds > 0 || result) result += `${seconds}s `;
		result += `${milliseconds}ms`;

		return result.trim();
	}

	private logResponse(isError: boolean) {
		const expanded = LOG_APIS.some((api) => this.path.toUpperCase().indexOf(api) != -1);

		let request;
		try {
			request = JSON.parse(this.request);
		} catch (error) {
			request = this.request;
		}

		let logPayload: AxiosResponseLogV2 = {
			type: "RES",
			isError: isError,
			message: "OK",
			method: this.method.toUpperCase(),
			serviceName: this.serviceName,
			status: this.status.toString(),
			time: this.duration?.toString() || "-",
			url: this.path,
			expanded: expanded,
			prefix: this.prefix,
			payload: {
				request,
				response: this.response,
			},
		};
		if (this.response.success) {
			log.axiosLog(logPayload);
		} else {
			log.axiosErrorLog({
				...logPayload,
				expanded: true,
			});
		}
	}

	public getResponse(): IApiSuccess<T> {
		if (!this.response.success) {
			throw new RequestError(this.response.error, this.response, this.status);
		}

		return this.response;
	}
}

export class AxiosHelper {
	private name: string;
	private conector: AxiosInstance;
	private prefix: string;
	private logged: boolean = false;
	private expiration!: Dayjs;
	private loginConfig?: ILogginConfig;
	private refreshConfig?: IRefreshConfig;
	private tokenConfig?: ITokenConfig;

	// defaults: any;
	successKey?: string | string[];

	constructor(data: IAxiosConfig) {
		let options: CreateAxiosDefaults = {
			timeout: (data.timeout || 20) * 1000,
			metadata: { startTime: new Date() },
			baseURL: data.baseUrl,
		};

		if (data.token) {
			options.headers = {
				Authorization: `${
					data.token.indexOf("Bearer ") == -1 && data.token.indexOf("Basic ") == -1 ? "Bearer " : ""
				}${data.token}`,
			};
		}

		this.prefix = data.prefix || "🌐";
		this.conector = axios.create(options);
		this.successKey = data.successKey;

		this.conector.interceptors.request.use((request: InternalAxiosRequestConfig) => {
			const includedApi = LOG_APIS.some((url) => getApiUrl(request).toUpperCase().indexOf(url) != -1);

			let payload = {
				body:
					(request.data instanceof URLSearchParams ? Object.fromEntries(request.data) : request.data) || "-",
				params: request.params || "-",
			};

			log.axiosLog({
				serviceName: this.name,
				url: request.url!,
				method: request.method?.toUpperCase() || "",
				type: "REQ",
				payload: payload,
				expanded: includedApi,
				prefix: this.prefix,
			});

			if (request.metadata) request.metadata.startTime = new Date();
			return request;
		});

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
					success: false,
					stringResponse: response,
				};
			}

			return parsedResponse;
		};

		this.name = data.serviceName;

		if (!data.login) {
			this.logged = true;
		} else {
			this.loginConfig = data.login;
		}

		if (data.refresh) {
			this.refreshConfig = data.refresh;
		}

		if (data.tokenConfig) {
			this.tokenConfig = data.tokenConfig;
		}
		// this.defaults = this.conector.defaults;
	}

	private validateToken(): boolean {
		if (!this.logged) return false;
		const now = dayjs();
		if (this.expiration && this.expiration.isBefore(now)) {
			this.logged = false;
			return false;
		}

		return true;
	}

	private async login() {
		try {
			if (this.loginConfig && !this.logged) {
				console.log(`[${this.name}] Logging into API`, this.loginConfig.url);
				const response = await axios.request({
					url: this.loginConfig.url,
					data: this.loginConfig.body,
					headers: this.loginConfig.headers,
					method: this.loginConfig.method || "post",
					params: this.loginConfig.queryParams,
				});

				console.log(`[${this.name}] ✅ Loggin successful`);

				const token = extractObjectValue(response.data, this.tokenConfig!.key!);
				this.setToken(`${this.tokenConfig?.prefix} ${token}`);
				this.logged = true;

				if (this.tokenConfig) {
					if (this.tokenConfig.expiration) {
						this.expiration = dayjs().add(this.tokenConfig.expiration, this.tokenConfig.format);
					} else if (this.tokenConfig.expirationKey) {
						const expiration = extractObjectValue<number>(response.data, this.tokenConfig.expirationKey);

						this.expiration = dayjs().add(expiration!, this.tokenConfig.format);
					}

					console.log(
						`[${this.name}] Token expiration set to`,
						this.expiration.format("DD/MM/YYYY HH:mm:ss")
					);
				}
			}
		} catch (error) {
			console.log(`[${this.name}]Error loging into API`, error);
		}
	}

	private async refresh() {
		try {
			if (this.refreshConfig && !this.logged) {
				const response = await axios.request({
					url: this.refreshConfig.url,
					data: this.refreshConfig.body,
					headers: {
						...this.refreshConfig.headers,
						Authorization: this.refreshConfig.usesCurrentToken
							? this.conector.defaults.headers.Authorization
							: undefined,
					},
					method: this.refreshConfig.method || "post",
					params: this.refreshConfig.queryParams,
				});

				const token = extractObjectValue(response.data, this.tokenConfig?.key!);
				this.setToken(token!);

				if (this.tokenConfig) {
					if (typeof this.tokenConfig.expiration) {
						this.expiration = dayjs().add(this.tokenConfig.expiration!, this.tokenConfig.format);
					} else if (typeof this.tokenConfig.key) {
						const expiration = extractObjectValue<number>(response.data, this.tokenConfig.key!);

						this.expiration = dayjs(expiration).add(expiration!, this.tokenConfig.format);
					}
				}
			} else if (!this.refreshConfig) {
				await this.login();
			}
		} catch (error) {
			log.error("Error refreshing token", error);
		}
	}

	private async loginOrRefresh() {
		this.validateToken();
		if (!this.logged) await this.login();
		else if (this.expiration && this.expiration.isBefore(dayjs().subtract(1, "minute"))) {
			await this.refresh();
		}
	}

	public async request<T>(config: IRequestOptions): Promise<ApiResponse<T>> {
		try {
			await this.loginOrRefresh();

			const response = await this.conector.request<T>({
				method: config.method || "get",
				url: config.url,
				params: config.query,
				data: config.body,
				headers: config.headers,
				timeout: config.timeout,
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
				data: error,
				prefix: this.prefix,
				serviceName: this.name,
				successKey: this.successKey,
			});
		}
	}

	// public setDefaults(options: any) {
	// 	this.conector.defaults = {
	// 		...this.conector.defaults,
	// 		...options,
	// 	};
	// }

	public setToken(token: string) {
		this.conector.defaults.headers.Authorization = `${token}`;
	}

	public setHeader(key: string, value: string) {
		this.conector.defaults.headers.common[key] = value;
	}

	public getBaseUrl() {
		return this.conector.defaults.baseURL;
	}

	public setBaseUrl(url: string) {
		this.conector.defaults.baseURL = url;
	}

	// public restoreDefaults() {
	// 	this.conector.defaults = this.defaults;
	// }
}

export default (config: IAxiosConfig): AxiosHelper => {
	const conector = new AxiosHelper(config);

	return conector;
};
