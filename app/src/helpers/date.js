import dayjs from "dayjs";
import { DATE_FORMAT_DB, DATE_FORMAT_VIEW, DATE_UTC } from "./constants";

export const convertDate = (date) => {
	if (date) return dayjs(date);

	return dayjs();
};

export const dbDate = (date) => {
	return dayjs(date).utc(DATE_UTC).format(DATE_FORMAT_DB);
};

export const viewDate = (date) => {
	return dayjs(date).utc(DATE_UTC).format(DATE_FORMAT_VIEW);
};
