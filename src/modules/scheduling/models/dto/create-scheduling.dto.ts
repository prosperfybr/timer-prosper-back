export interface CreateSchedulingDTO {
	establishmentId: string;
	collaboratorId: string;
	serviceId: string;
	clientId: string;
	date: string; //- YYYY-MM-DD
	startTime: string; //- HH:mm
	notes?: string;
}
