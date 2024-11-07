// import httpContext from "express-http-context";
import { format } from "winston";
import Log from "./Logger";
import { AxiosRequestLogV2, AxiosResponseLogV2 } from "../../types/Axios";
// import { getContext } from "../../utils/utils";
import { getContext } from "../../loaders/routes/context";

const { combine, timestamp, printf, align } = format;

export default class AxiosLogger extends Log {
	constructor(service: string, flowId?: string) {
		super(service, flowId || "");

		this.logger.format = combine(
			timestamp({
				format: "DD/MM/YYYY HH:mm:ss.SSS",
			}),
			align(),
			printf((info) => {
				const context: any = getContext();
				const reqId = context ? context["reqId"] : "-";
				const flowId = context ? context["flowId"] : "-";
				const meta: AxiosRequestLogV2 | AxiosResponseLogV2 = JSON.parse(info.message);

				let msg = `${info.timestamp} [REQ_ID: ${reqId} | FLOW_ID: ${flowId || info.flowId}] - (${
					meta.serviceName
				} - ${meta.type})  => \n ${meta.prefix ? meta.prefix : ""} ${meta.method} ${meta.url}`;

				if (meta.type == "REQ") {
					msg += ` | payload: ${meta.expanded ? JSON.stringify(meta.payload) : "-IGNORED-"}`;
				} else {
					msg += ` | status: ${meta.status} | duration: ${meta.time}`;

					if (!meta.expanded) {
						msg += ` | ${meta.isError ? "FAIL ❌" : "SUCCESS ✅"}`;
					} else {
						msg += ` | payload: ${
							typeof meta.payload === "object" ? JSON.stringify(meta.payload, null, 2) : meta.payload
						}`;
					}
				}

				msg += "\n";
				return msg;
			})
		);
	}

	axiosLog(data: AxiosRequestLogV2 | AxiosResponseLogV2) {
		this.logger.info(JSON.stringify(data));
	}

	axiosErrorLog(data: AxiosRequestLogV2 | AxiosResponseLogV2) {
		this.logger.error(JSON.stringify(data));
	}
}
