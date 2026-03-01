import { log } from "@config/Logger";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { UnauthorizedException } from "@shared/exceptions/UnauthorizedException";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { DoLoginDTO } from "../models/dto/do-login.dto";
import { LoginResponseDTO } from "../models/dto/login-response.dto";
import { RefreshTokenEntity } from "../models/entity/refresh-token.entity";
import { LoginService } from "../services/login.service";
import { ControllerLog } from "@shared/decorators/logs/controller.decorator";

@RequestMapping("auth")
@RestController()
export class LoginController {
	constructor(private readonly loginService: LoginService) {}

	@PostMapping("/login")
	@ControllerLog()
	public async login(req: Request, res: Response, next: NextFunction) {
		try {
			const login: DoLoginDTO = req.body as DoLoginDTO;
			const { token, refreshToken, type, expiresIn, refreshExpiresIn, user, establishment }: LoginResponseDTO = await this.loginService.doLogin(
				login,
				req.ip,
				req.get("User-Agent"),
			);

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "prd",
				sameSite: "strict",
				expires: refreshExpiresIn,
			});

			delete user.establishments;
			delete user.password;

			return res.status(HttpStatusCode.Ok).json({
				message: "Usuário logado com sucesso.",
				payload: {
					accessToken: token,
					refreshToken: refreshToken,
					type,
					expiresIn,
					user,
					establishment,
				},
			});
		} catch (error) {
			log.error("An error has occurred while save a new user. ERROR: ", error);
			next(error);
		}
	}

	@PostMapping("/refresh")
	@ControllerLog()
	public async getUser(req: Request, res: Response, next: NextFunction) {
		try {
			const rawRefreshToken = req.cookies?.refreshToken;

			if (!rawRefreshToken) {
				log.error(`Refresh token is not valid or not sended. REFRESH: [${rawRefreshToken}]`);
				throw new UnauthorizedException("Refresh token não fornecido.");
			}

			const tokenEntity: RefreshTokenEntity = await this.loginService.validateRefreshToken(rawRefreshToken);

			if (!tokenEntity || !tokenEntity.user) {
				res.clearCookie("refreshToken");
				return res.status(403).json({ message: "Sessão inválida ou expirada. Faça login novamente." });
			}

			const { token: newAccessToken, expiresIn }: { token: string; expiresIn: number } = this.loginService.generateAccessToken(tokenEntity.user);
			await this.loginService.revokeRefreshToken(tokenEntity);
			const { refreshToken, expiresIn: refreshExpiresIn }: { refreshToken: string; expiresIn: Date } =
				await this.loginService.generateAndSaveRefreshToken(tokenEntity.user, req.ip, req.get("User-Agent"));

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "prd",
				sameSite: "strict",
				expires: refreshExpiresIn,
			});

			return res.status(HttpStatusCode.Ok).json({
				message: "Token atualizado com sucesso.",
				payload: {
					accessToken: newAccessToken,
					expiresIn,
				},
			});
		} catch (error) {
			log.error("An error has occured while update refresh token. ERROR: ", error);
			next(error);
		}
	}

	@PostMapping("/logout", { authenticated: true })
	@ControllerLog()
	public async logout(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.user;
			await this.loginService.logout(id);
			return res.status(HttpStatusCode.Ok).json({
				message: "Usuário deslogado com sucesso",
				payload: null,
			});
		} catch (error) {
			log.error(`An error has occurred while logging out user. ERROR: `, error);
			next(error);
		}
	}
}
