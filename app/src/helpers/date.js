import dayjs from "dayjs";
import { DATE_FORMAT_DB, DATE_FORMAT_VIEW, DATE_UTC } from "./constants";

export const convertDate = (date, useFormat) => {
	if (useFormat) return dayjs(date).utc(DATE_UTC).format(useFormat);

	if (date) return dayjs(date).utc(DATE_UTC);

	return dayjs().utc(DATE_UTC);
};

export const dbDate = (date) => {
	return dayjs(date).utc(DATE_UTC).format(DATE_FORMAT_DB);
};

export const viewDate = (date) => {
	return dayjs(date).utc(DATE_UTC).format(DATE_FORMAT_VIEW);
};
