import { UserResponseDTO } from "@modules/users/models/dto/user-response.dto";
import { EstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/establishment-response.dto";
import { ServiceResponseDTO } from "@modules/services/models/dto/service-response.dto";

export interface CollaboratorResponseDTO {
	id: string;
	userId: string;
	user?: UserResponseDTO;
	establishmentId: string;
	establishment?: EstablishmentResponseDTO;
	servicesIds: string[];
	services?: ServiceResponseDTO[];
	collaboratorFunction: string;
	specialty: string;
	hiringDate?: Date;
	active: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}


export interface CollaboratorStats {
  collaboratorId: string;
  appointmentsToday: number;
  totalClients: number;
  occupationRate: number;
  scheduledHours: number;
}