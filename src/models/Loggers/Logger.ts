import { getContext } from "../../loaders/routes/context";
import { Logger, createLogger, transports, format, addColors, config } from "winston";
const { combine, timestamp, printf, align, colorize } = format;

const build = (message: string | Error | object, data?: any, meta?: Object) => {
	//TODO Tipar message
	let result = {
		message,
		data: {
			data: data,
			meta: {
				noMessage: false,
				...meta,
			},
		},
	};

	if (typeof message == "string") {
		result.message = message;
	} else {
		result.message = " ";
		if (message instanceof Error) {
			result.data.data = JSON.stringify({
				message: message.message,
				stack: message.stack,
			});
		} else {
			result.data.data = JSON.stringify(message);
		}
		result.data.meta.noMessage = true;
	}

	return result;
};
const timestampFormat = { format: "DD/MM/YYYY HH:mm:ss.SSS" }

export default class Log {
	logger: Logger;
	prefix: string;
	constructor(service: string, flowId?: string, prefix?: string) {
		this.prefix = prefix || "";
		const context: any = getContext();
		const colors = {
			alert: 'bold red',
			error: 'red',
			warning: 'yellow',
			notice: 'italic blue',
			info: 'green',
			debug: 'blue'
		}
		this.logger = createLogger({
			levels: config.syslog.levels,
			format: combine(
				colorize({all: true}),
				timestamp(timestampFormat),
				align(),
				printf((info) => {
					const { timestamp, service, level, message, ...extra } = info;
					const { data, meta } = extra.data;

					const customLevel = meta?.level || level;
					const idComparison = context? this.formatIdComparison(context) : '';
					const msg = this.formatDataMsg(data, meta, message, this.prefix);

					return `${timestamp} - (${service} - ${customLevel}) ${idComparison}=>${msg}\n`;
				}),
			),
			transports: [new transports.Console()],
			exitOnError: false,
			defaultMeta: {
				service,
				flowId: flowId,
			},
		});
		addColors(colors);
	}

	formatIdComparison(context:any){
		const reqId = `REQ_ID: ${context?.reqId || "-"}`
		const flowId = `FLOW_ID: ${context?.flowId || "-"}`
		return `[${reqId} | ${flowId}] `;
	}

	formatDataMsg(data:any, meta:any, message:any, prefix:any){
		let msgData = "";
		let msg = prefix ? `${prefix} ` : ' ';
			if (data) {
				msgData = (typeof data == "object") ? JSON.stringify(data) : data;
			}
			if (meta.noMessage) {
				msg += msgData ? msgData : '';
			} else {
				msg += message.startsWith("\t") ? message.replace("\t", "") : message;
				msg += msgData ? msgData : '';
			}
		return msg
	}

	setFlowId(flowId: string) {
		this.logger.defaultMeta.flowId = flowId;
	}

	getFlowId() {
		return this.logger.defaultMeta.flowId;
	}

	deleteFlowId() {
		this.logger.defaultMeta.flowId = null;
	}

	clear() {
		this.logger.defaultMeta = {};
	}

	info(message: string | Object, data?: Object) {
		this.logger.info(build(message, data));
	}

	log(message: string | Object, data?: Object) {
		let logEntry = build(message, data);
		logEntry.message = `📓 ` + logEntry.message;
		logEntry.data.meta.noMessage = false;
		this.logger.notice(logEntry);
	}

	warn(message: string | Object, data?: Object) {
		let logEntry = build(message, data);
		logEntry.message = `⚠️ ` + logEntry.message;
		logEntry.data.meta.noMessage = false;
		this.logger.warning(logEntry);
	}

	error(message: string | Object, data?: Object) {
		let logEntry = build(message, data);
		logEntry.message = `⛔ ` + logEntry.message;
		logEntry.data.meta.noMessage = false;
		if (logEntry.data.data && logEntry.data.data.stack) {
			let error = logEntry.data.data.message;
			let stack = logEntry.data.data.stack;
			logEntry.data.data = {
				error,
				stack,
			};
		}
		this.logger.error(logEntry);
	}

	alert(message: string | Object, data?: Object) {
		let logEntry = build(message, data);
		logEntry.message = `🚨 ` + logEntry.message;
		logEntry.data.meta.noMessage = false;
		if (logEntry.data.data && logEntry.data.data.stack) {
			let error = logEntry.data.data.message;
			let stack = logEntry.data.data.stack;
			logEntry.data.data = {
				error,
				stack,
			};
		}
		this.logger.alert(logEntry);
	}

	debugg(message: string | Object, data?: Object) {
		this.logger.debug(build(message, data));
	}

	db(message: string | Object, data?: Object) {
		let log = build(message, data);
		log.message = `💾 ${log.message}`;
		this.logger.info(log);
	}
}
