import { IApiError } from "../../types/General";
import Log from "../Loggers/Logger";
const log = new Log("DB", "", "💾");

export const parseError = (error: any): string => {
	try {
		const query = error.sql ? error.sql.substring(0, error.sql.indexOf("(")) : error.message;
		const errorMsg = error.errors?.length ? error.errors.map((i: any) => i.message).join(" \n ") : error.message;
		const msg = `Error ejecutando query ${query} => ${errorMsg}`;
		log.error(msg);
		return msg;
	} catch (error) {
		log.error("Error parsing database error", error);
		return "Error";
	}
};

export const parseErrorAsApiError = (error: any): IApiError => {
	try {
		const errorMsg = parseError(error);

		return {
			success: false,
			data: {
				error: errorMsg,
				details: error.errors,
			},
		};
	} catch (error) {
		log.error("Error parsing database error", error);
		return {
			success: false,
			data: {
				error: "Error",
				details: error,
			},
		};
	}
};
