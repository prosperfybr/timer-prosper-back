import { Service } from "@shared/decorators/service.decorator";

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
	export interface DTO {}

	export interface SLOT {
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