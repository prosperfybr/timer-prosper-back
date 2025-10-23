import { log } from "@config/Logger";
import { RolesEnum } from "@modules/users/dto/RolesEnum";
import { NextFunction, Request, Response } from "express";

export function can(role: RolesEnum | string) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const { role: userRole } = req.user;

		if (role !== userRole) {
			log.error("User has not permission to access this resource");
			return res.status(403).json({ message: "Você não possui permissão para acessar este recurso." });
		}

		return next();
	};
}
