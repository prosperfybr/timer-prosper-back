import { RolesEnum } from "./RolesEnum";

export interface CreateUserDTO {
  name: string;
  email: string;
  cpf?: string;
  password: string;
  role?: RolesEnum;
}