import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

export enum RolesEnum {
	ADMIN = "admin",
	OWNER = "proprietario",
	COLLABORATOR = "colaborador",
	CLIENT = "cliente",
}

export function getRolesEnumValue(roleString: string): RolesEnum {
	const validRoles = Object.values(RolesEnum);
	const matchedRole = validRoles.find((role) => role === roleString);
	if (matchedRole) return matchedRole as RolesEnum;
	throw new InvalidArgumentException(`Papel/Role inválido fornecido: "${roleString}". Valores permitidos: ${validRoles.join(", ")}`);
}
