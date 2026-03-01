import { DaysOfWeekEnum } from "@modules/establishment/models/enums/days-of-week.enum";
import { AbsenceBlockTypeEnum } from "../enums/absence-block-type.enum";

export interface UpdateAbsenceBlockDTO {
	id: string;
	type?: AbsenceBlockTypeEnum;
	isRecurrent?: boolean;
	dayOfWeek?: DaysOfWeekEnum;
	specificDate?: Date;
	collaboratorId?: string;
	serviceId?: string;
	establishmentId: string;
	description?: string;
	startTime?: string;
	endTime?: string;
	active: boolean;
}
