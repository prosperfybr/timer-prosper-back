import { DaysOfWeekEnum } from "../../enums/days-of-week.enum";

export interface CreateEstablishmentHourDTO {
	establishmentId: string;
	hours: {
		dayOfWeek: DaysOfWeekEnum;
		openingTime: string;
		closingTime: string;
	}[];
}
