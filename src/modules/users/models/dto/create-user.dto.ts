import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { RolesEnum } from "../enum/roles.enum";

export class CreateUserDTO {
	@IsNotEmpty({ message: "O nome é obrigatório" })
	@IsString({ message: "O nome deve ser uma string" })
	name: string;

	@IsNotEmpty({ message: "O email é obrigatório" })
	@IsEmail({}, { message: "Email inválido" })
	email: string;

	@IsOptional()
	@IsString()
	cpf?: string;

	@IsNotEmpty({ message: "A senha é obrigatória" })
	@MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres" })
	password: string;

	@IsOptional()
	@IsEnum(RolesEnum, { message: "Role inválida" })
	role?: RolesEnum;
}
