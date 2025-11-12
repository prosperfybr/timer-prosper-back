import { UserResponseDTO } from "@modules/users/dto/user-response.dto";
import { EstablishmentResponseDTO } from "@modules/establishment/dto/establishment-response.dto";
import { ServiceResponseDTO } from "@modules/services/dto/service-response.dto";

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