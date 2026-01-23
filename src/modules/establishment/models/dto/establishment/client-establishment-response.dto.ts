import { EstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/establishment-response.dto";
import { ClientRequestByEnum } from "@modules/establishment/models/enums/client-request-by.enum";
import { ClientRequestStatusEnum } from "@modules/establishment/models/enums/client-request-status.enum";
import { UserResponseDTO } from "@modules/users/models/dto/user-response.dto";

export interface ClientEstablishmentResponseDTO {
	id: string;
	userId: string;
	user?: UserResponseDTO;
	clientEmail?: string;
	establishmentId: string;
	establishment?: EstablishmentResponseDTO;
	status: ClientRequestStatusEnum;
	requestedBy: ClientRequestByEnum;
	requestedAt: Date;
	approvedAt?: Date;
	rejectedAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}
