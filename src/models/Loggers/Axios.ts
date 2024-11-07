// import httpContext from "express-http-context";
import { format } from "winston";
import Log from "./Logger";
import { AxiosErrorLog, AxiosRequestLog } from "../../types/Axios";
// import { getContext } from "../../utils/utils";
import { getContext } from "../../loaders/routes/context";

const { combine, timestamp, printf, align } = format;
const timestampFormat = { format: "DD/MM/YYYY HH:mm:ss.SSS" }

export default class AxiosLogger extends Log {
	constructor(service: string, flowId?: string) {
		super(service, flowId || "");
		const context: any = getContext();
		this.logger.format = combine(
			timestamp(timestampFormat),
			align(),
			printf((info) => {
				const { timestamp, service, level, message } = info;
				const meta: AxiosRequestLog = JSON.parse(message);

				const idComparison = context? this.formatIdComparison(context) : '';
				const method = `${meta.method?.toUpperCase()}${meta.isError ? "_ERROR" : ""}`
				let msg = `${timestamp} - (${service} - ${level}) <${method}> ${idComparison}=> ${meta.prefix ? meta.prefix : ""} `;

				if (meta.isError) {
					msg += ` Error ejecutando API ${meta.url} => status: ${meta.status} data:  ${
						meta.data && typeof meta.data == "string" ? meta.data : JSON.stringify(meta.data.data)
					}`;
				} else {
					if (meta.expanded) {
						msg += JSON.stringify({
							URL: meta.url,
							data: meta.data,
							params: meta.params,
						});
					} else {
						msg += `${meta.method.toUpperCase()} ${meta.url}`;
						if (meta.data) msg += `: ${meta.data ? "success" : "fail"}`;
					}
				}
				msg += "\n";
				return msg;
			})
		);
	}

	formatIdComparison(context:any){
		const reqId = `REQ_ID: ${context?.reqId || "-"}`
		const flowId = `FLOW_ID: ${context?.flowId || "-"}`
		return `[${reqId} | ${flowId}] `;
	}

	axiosLog(data: AxiosRequestLog) {
		this.logger.info(JSON.stringify(data));
	}

	axiosErrorLog(data: AxiosErrorLog) {
		this.logger.error(JSON.stringify(data));
	}
}
