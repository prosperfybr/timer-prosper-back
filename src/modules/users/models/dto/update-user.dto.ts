import { RolesEnum } from "../enum/roles.enum";

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
