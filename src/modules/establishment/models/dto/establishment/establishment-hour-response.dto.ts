import { EstablishmentResponseDTO } from '@modules/establishment/models/dto/establishment/establishment-response.dto';
import { DaysOfWeekEnum } from '../../enums/days-of-week.enum';

export interface HourResponseDTO {
	id: string;
	dayOfWeek: DaysOfWeekEnum;
	startTime: string;
	endTime: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface EstablishmentHourResponseDTO {
	establishmentId: string;
	establishment?: EstablishmentResponseDTO;
	hours: HourResponseDTO[];
}
