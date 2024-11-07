import dayjs, { Dayjs as DayjsType } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isLeapYear from "dayjs/plugin/isLeapYear";
import es from "dayjs/locale/es";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(isLeapYear);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale(es);
dayjs.tz.setDefault("America/Santiago");

export const moment = dayjs;
export default dayjs;
export type { DayjsType as Dayjs };