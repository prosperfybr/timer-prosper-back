import { log } from "@config/Logger";
import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { NextFunction, Request, Response } from "express";
import { getRolesEnumValue } from "../../modules/users/models/enum/roles.enum";

export function can(roles: RolesEnum[] | string[]) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const { role } = req.user;

		if (!roles.includes(getRolesEnumValue(role))) {
			log.error("User has not permission to access this resource");
			return res.status(403).json({ message: "Você não possui permissão para acessar este recurso." });
		}

		log.info("User has permission to proceed");
		return next();
	};
}
