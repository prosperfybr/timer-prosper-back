import { Service } from "@shared/decorators/service.decorator";
import { AppointmentStatusEnum } from "../enums/appointment-status.enum";

export interface SchedulingResponseDTO {
	id: string;
	name: string;
	active: boolean;
}

@Service()
export class SchedulingResponse {
	public toSlot(): SchedulingResponse.SLOT[] {
		return [];
	}
}

export namespace SchedulingResponse {
	export interface DTO {
		id?: string;
		establishmentId?: string;
		collaboratorId?: string;
		serviceId?: string;
		clientId?: string;
		clientName?: string;
		clientWhatsapp?: string;
		date?: string;
		startTime?: string;
		endTime?: string;
		status?: AppointmentStatusEnum;
		notes?: string;
		createdAt?: string;
		updatedAt?: string;
	}

	export interface SLOT extends DTO {
		date: string; // YYYY-MM-DD
		time: string; // HH:mm
		collaboratorId: string;
		collaboratorName: string;
		available: boolean; // false se já agendado
		serviceId: string;
		serviceName: string;
		servicePrice: number;
		serviceDuration: number;
		establishmentName: string;
	}
}
