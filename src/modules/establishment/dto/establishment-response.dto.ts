import { ServiceResponseDTO } from "@modules/services/dto/service-response.dto";
import { UserResponseDTO } from "@modules/users/dto/user-response.dto";

export interface EstablishmentResponseDTO {
  id: string;
  userId: string;
  tradeName: string;
  logo: string;
  logoDark: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  mainPhone: string;
  website: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  youtube: string;
  createdAt?: Date;
  updatedAt?: Date;
  user?: UserResponseDTO;
  services?: ServiceResponseDTO[];
}