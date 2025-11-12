import { RolesEnum } from "./RolesEnum";

export interface UpdateUserDTO {
  userId?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: RolesEnum;
  birthdate?: Date;
  whatsApp?: string;
  cpf?: string;
  profilePreferences?: string;
}