import { log } from "@config/Logger";
import { UserEntity } from "@modules/users/user.entity";
import { UserRepository } from "@modules/users/users.repository";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface AuthenticatedPayload {
  sub: string;
}

export function ensureAuthenticated() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const accessToken: string = req.headers.authorization;

    if (!accessToken) {
      log.error("Invalid token");
      return res.status(401).json({ message: "Token inválido" });
    }

    if (!accessToken.startsWith("Bearer ")) {
      log.error("Token does not start with 'Bearer'");
      return res.status(401).json({ message: "Token mal formado"});
    }

    const [, token] = accessToken.split(" ");
    try {
      const { sub } = verify(token, process.env.ACCESS_TOKEN_SECRET) as AuthenticatedPayload;
      const userRepository: UserRepository = new UserRepository();
      const user: UserEntity = await userRepository.findById(sub);
      req.user = { id: user.id, role: user.role };
      return next();
    } catch (error) {
      log.error("An error has occurred while validating JWT. ERROR: ", error);
      return res.status(401).json({ message: "Token inválido"});
    }
  }
}