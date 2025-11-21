import { UserResponseDTO } from "@modules/users/models/dto/user-response.dto";

export interface LoginResponseDTO {
	token: string;
	refreshToken: string;
	type: "Bearer";
	expiresIn: string | number;
	refreshExpiresIn: Date;
	user: UserResponseDTO;
}
