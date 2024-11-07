export interface IWorkerOptions<T> {
	name: string;
	flowId?: string;
	payload?: T;
	callback?: Function;
	keepRunning?: boolean;
}

export type STRING_FORMATS =
	| "PATENTE"
	| "PRECIO"
	| "KILOMETROS"
	| "CELULAR"
	| "RUT"
	| "RUT_SIMPLE"
	// | "PATENTE2"
	| "ZENDESK_PHONE"
	| "RSYS_PHONE";

export interface IRunworkerOptions<T> {
	flowId?: string;
	siteId?: string;
	payload: T | null;
	context: any;
}

export type PartialExceptSpecial<T, K extends keyof T> = {
	[P in keyof T]?: P extends K ? T[P] : T[P] | undefined;
};

export interface IAppointmentTime {
	weeks?: number;
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
	before?: boolean;
}
export interface IIcs {
	id?: string;
	date: string;
	hour: string;
	title: string;
	description?: string;
	duration?: string | IAppointmentTime;
	location?: string;
	url?: string;
}

export interface IConvertToLabelValueOptions {
	format: STRING_FORMATS;
	labelFormat: STRING_FORMATS;
	valueFormat: STRING_FORMATS;
	sort: boolean;
	formatCondition: (a: any) => boolean;
	upper: boolean;
}
