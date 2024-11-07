export interface ServiceConstructor {
	flowId: string;
	logName: string;
}

export interface ParamsList {
	name: string;
	value: any;
	validator: Joi.Schema;
	forcedMessage?: string;
}
