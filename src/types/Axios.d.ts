import { InternalAxiosRequestConfig } from "axios";

type ApiCredentials = {
	user: string;
	password: string;
};

type AxiosConfig = {
	baseUrl?: string;
	token?: string;
	bearer?: string;
	credentials?: ApiCredentials;
	timeout?: number;
	responseValidator?: Function;
	errorResponseValidator?: Function;
	headers?: Object;
	prefix?: string;
};

type AxiosBody = {
	params: Object;
	data: Object;
};

interface AxiosRequestLog {
	url: string;
	method: string;
	type: string;
	data: AxiosBody;
	params?: Object;
	expanded: boolean;
	isError?: boolean;
	status?: string;
	prefix?: string;
}

interface AxiosRequestLogV2 {
	type: "REQ";
	serviceName: string;
	method: string;
	url: string;
	payload: string | object;
	prefix?: string;
	expanded?: boolean;
}

interface AxiosResponseLogV2 {
	type: "RES";
	serviceName: string;
	method: string;
	url: string;
	status: string;
	time: string;
	message: string;
	payload: string | object;
	prefix?: string;
	isError: boolean;
	expanded?: boolean;
}

interface AxiosErrorLog {
	url: string;
	method: string;
	status: number;
	data: AxiosBody;
	isError: true;
	params?: Object;
	prefix?: string;
}

declare module "axios" {
	export interface AxiosRequestConfig {
		metadata?: {
			startTime: Date;
		};
		customValidator?: Function;
	}

	export interface AxiosResponse {
		duration: number;
	}
}
