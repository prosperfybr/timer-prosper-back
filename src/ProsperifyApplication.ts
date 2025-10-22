import { HttpStatusCode } from "axios";
import cors from "cors";
import express, {NextFunction, Request, Response, Router } from "express";
import { AppDataSource } from "../ormconfig";
import { log } from "@config/Logger";


export class ProsperifyApplication {

  public async main(): Promise<void> {
    log.info("Starting Prosperify API");

    log.info("Iniciando configurações da aplicação...");
    log.info("[EXPRESS] Configuração de roteamento da aplicação.");
    const app = express();
    app.use(cors());
    app.use(express.json({ limit: "10mb"}));
    app.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 10 }));
    const router: Router = Router();
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      if (error instanceof Error) {
        return res.status(HttpStatusCode.BadRequest).json({
          code: HttpStatusCode.BadRequest,
          message: error.message,
          payload: error
        });
      }

      return res.status(HttpStatusCode.InternalServerError).json({
        code: HttpStatusCode.InternalServerError,
        message: "Internal server error"
      });
    });
    log.info("[EXPRESS] Configuração de roteamento finalizado.");

    log.info("[DATABASE] Iniciando conexão com banco de dados");
    await AppDataSource.initialize();
    log.info("[DATABASE] Conexão com banco de dados finalizada com sucesso");

    const door: string | number = process.env.PORT || 8081;
    app.listen(door, () => {
      log.info(`🚀 Server is running on: http://localhost:${door}`);
    });
  }
}