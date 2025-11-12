import {UserResponseDTO} from "@modules/users/dto/user-response.dto";
import {EstablishmentResponseDTO} from "@modules/establishment/dto/establishment-response.dto";
import {ClientRequestStatusEnum} from "@modules/establishment/dto/client-request-status.enum";
import {ClientRequestByEnum} from "@modules/establishment/dto/client-request-by.enum";

export interface ClientEstablishmentResponseDTO {
    id: string;
    userId: string;
    user?: UserResponseDTO;
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