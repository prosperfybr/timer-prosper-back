import { RolesEnum } from "../enum/roles.enum";

export interface CreateUserDTO {
	name: string;
	email: string;
	cpf?: string;
	password: string;
	role?: RolesEnum;
}
