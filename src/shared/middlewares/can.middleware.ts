import { log } from "@config/Logger";
import { RolesEnum } from "@modules/users/dto/RolesEnum";
import { UserEntity } from "@modules/users/user.entity";
import { UserRepository } from "@modules/users/users.repository";
import { NextFunction, Request, Response } from "express";

export function can(roles: RolesEnum[] | string[]) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.user;
		const userRepository: UserRepository = new UserRepository();
		const user: UserEntity = await userRepository.findById(id);

		if (!roles.includes(user.role)) {
			log.error("User has not permission to access this resource");
			return res.status(403).json({ message: "Você não possui permissão para acessar este recurso." });
		}

		log.info("User has permission to proceed");
		return next();
	};
}
