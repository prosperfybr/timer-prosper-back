import { RolesEnum } from "../enum/roles.enum";
import { UserPreferencesResponseDTO } from "./user-preferences-response.dto";

export interface UserResponseDTO {
	id: string;
	name: string;
	email: string;
	password?: string;
	role?: RolesEnum;
	birthDate?: Date;
	whatsApp?: string;
	cpf?: string;
	profilePreferences?: string;
	profileComplete: boolean;
	userFunction?: string;
	preferences?: UserPreferencesResponseDTO;
	establsihmentId?: string;
	establishments?: any[];
}
