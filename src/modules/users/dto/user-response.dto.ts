import { RolesEnum } from "./RolesEnum";

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  password?: string;
  role?: RolesEnum;
  establishments?: any[];
}