import cookieParser from "cookie-parser";
import { HttpStatusCode } from "axios";
import cors from "cors";
import express, { NextFunction, Request, Response, Router } from "express";
import { AppDataSource } from "../ormconfig";
import { log } from "@config/Logger";
import { router } from "@shared/decorators/router/request-mapping.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { UnauthorizedException } from "@shared/exceptions/UnauthorizedException";
import { ForbiddenException } from "@shared/exceptions/ForbiddenException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

class ProsperifyApplication {
	public async main(): Promise<void> {
		log.info("Starting Prosperify API");

		log.info("Iniciando configurações da aplicação...");
		log.info("[EXPRESS] Configuração de roteamento da aplicação.");
		const app = express();
		app.use(cors());
		app.use(cookieParser());
		app.use(express.json({ limit: "10mb" }));
		app.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 10 }));

		require("./ProsperifyRoutes.ts");
		app.use(router);
		log.info("[EXPRESS] Configuração de roteamento finalizado.");

		app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
			if (error instanceof BadRequestException || error instanceof InvalidArgumentException) return res.status(400).json({ message: error.message, payload: error });
			if (error instanceof UnauthorizedException) return res.status(401).json({ message: error.message, payload: error });
			if (error instanceof ForbiddenException) return res.status(403).json({ message: error.message, payload: error });
			if (error instanceof Error) return res.status(HttpStatusCode.BadRequest).json({ message: error.message, payload: error });
			return res.status(HttpStatusCode.InternalServerError).json({ message: "Internal server error" });
		});

		log.info("[DATABASE] Iniciando conexão com banco de dados");
		await AppDataSource.initialize();
		log.info("[DATABASE] Conexão com banco de dados finalizada com sucesso");

		const door: string | number = process.env.PORT || 8081;
		app.listen(door, () => {
			log.info(`🚀 Server is running on: http://localhost:${door}`);
		});
	}
}

new ProsperifyApplication().main();