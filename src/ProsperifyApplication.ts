import dotenv from "dotenv";
import path from "path";

// Carrega explicitamente o .env da raiz do WORKDIR (/src/.env)
const envPath = path.resolve(__dirname, "../../.env"); // Ajuste para sair de dist/src/ para a raiz
console.log(`[DEBUG] Tentando carregar .env de: ${envPath}`);
const result = dotenv.config({ path: "/src/.env" }); // Caminho absoluto fixo para garantir no Docker

if (result.error) {
	console.error("[DEBUG] Erro ao carregar .env:", result.error);
} else {
	console.log("[DEBUG] .env carregado com sucesso.");
	console.log("[DEBUG] DATABASE_URL definida?", !!process.env.DATABASE_URL);
}

import cookieParser from "cookie-parser";
import { HttpStatusCode } from "axios";
import cors, { CorsOptions } from "cors";
import express, { NextFunction, Request, Response, Router } from "express";
import compression from "compression";
import helmet from "helmet";
import { AppDataSource } from "@config/ormconfig";
import { log } from "@config/Logger";
import { generalLimiter } from "@shared/middlewares/rate-limit.middleware";
import { router } from "@shared/decorators/router/request-mapping.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { UnauthorizedException } from "@shared/exceptions/UnauthorizedException";
import { ForbiddenException } from "@shared/exceptions/ForbiddenException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import swaggerUi from "swagger-ui-express";
import { scheduler } from "@shared/schedulers/scheduler";

class ProsperifyApplication {
	public async main(): Promise<void> {
		log.info("Starting Prosperify API");

		log.info("Iniciando configurações da aplicação...");
		log.info("[EXPRESS] Configuração de roteamento da aplicação.");
		const app = express();

		const ALLOWED_ORIGINS: (string | RegExp)[] = ["*"];
		const corsConfig: CorsOptions = {
			origin: (origin, callback) => {
				// Permitir requests sem origin (como Postman/curl) ou da lista de permitidos
				if (!origin || ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)) {
					callback(null, true);
				} else {
					callback(new Error("Not allowed by CORS"));
				}
			},
			credentials: true,
			methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
			allowedHeaders: "Content-Type, Authorization, X-Requested-With, Accept, Origin",
			exposedHeaders: "Set-Cookie",
		};

		app.use(helmet());
		app.use(cors(corsConfig));
		app.use(cookieParser());
		app.use(express.json({ limit: "10mb" }));
		app.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 10 }));

		app.use(
			compression({
				filter: (req, res) => {
					if (req.headers["x-no-compression"]) {
						return false;
					}
					return compression.filter(req, res);
				},
				level: 6,
			}),
		);

		// ... inside main
		app.use(generalLimiter); // Rate limit global

		require("./ProsperifyRoutes");
		app.use(router);
		log.info("[EXPRESS] Configuração de roteamento finalizado.");

		app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
			if (error instanceof BadRequestException || error instanceof InvalidArgumentException)
				return res.status(400).json({ message: error.message, payload: error });
			if (error instanceof UnauthorizedException) return res.status(401).json({ message: error.message, payload: error });
			if (error instanceof ForbiddenException) return res.status(403).json({ message: error.message, payload: error });
			if (error instanceof Error) return res.status(HttpStatusCode.BadRequest).json({ message: error.message, payload: error });
			return res.status(HttpStatusCode.InternalServerError).json({ message: "Internal server error" });
		});

		log.info("[SWAGGER] Import swagger schema and define documentation route");
		const { swaggerDocs } = await import("../docs/swagger/swagger");
		app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
		log.info("[SWAGGER] Routed defined: '/api/docs to see Swagger documentation");

		log.info("[DATABASE] Iniciando conexão com banco de dados");
		await AppDataSource.initialize();
		log.info("[DATABASE] Conexão com banco de dados finalizada com sucesso");

		scheduler();

		const door: string | number = process.env.PORT || 8081;
		app.listen(door, () => {
			log.info(`🚀 Server is running on: http://localhost:${door}`);
		});
	}
}

new ProsperifyApplication().main();
