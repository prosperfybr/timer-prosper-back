import { log } from "@config/Logger";
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { LoginService } from "./services/login.service";
import { RestController } from "@shared/decorators/restcontroller.decorator";
import { PostMapping } from "@shared/decorators/router/post-mapping.decorator";
import { RequestMapping } from "@shared/decorators/router/request-mapping.decorator";
import { DoLoginDTO } from "./dto/do-login.dto";
import { LoginResponseDTO } from "./dto/login-response.dto";
import { UnauthorizedException } from "@shared/exceptions/UnauthorizedException";
import { RefreshTokenEntity } from "./refresh-token.entity";
import { RolesEnum } from "@modules/users/dto/RolesEnum";

@RequestMapping("auth")
@RestController()
export class LoginController {
	constructor(private readonly loginService: LoginService) {}

	@PostMapping("/login")
	public async login(req: Request, res: Response, next: NextFunction) {
		try {
			log.info("Request received to log in a user");

			const login: DoLoginDTO = req.body as DoLoginDTO;
			const { token, refreshToken, type, expiresIn, refreshExpiresIn, user }: LoginResponseDTO = await this.loginService.doLogin(login, req.ip, req.get("User-Agent"));

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "prd",
				sameSite: "strict",
				expires: refreshExpiresIn,
			});

			log.info("User logged in successfully");

			delete user.establishments;
			delete user.password;

			return res.status(HttpStatusCode.Ok).json({
				message: "Usuário logado com sucesso.",
				payload: {
					accessToken: token,
					type,
					expiresIn,
					user,
				},
			});
		} catch (error) {
			log.error("An error has occurred while save a new user. ERROR: ", error);
			next(error);
		}
	}

	@PostMapping("/refresh")
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
			const { refreshToken, expiresIn: refreshExpiresIn }: { refreshToken: string; expiresIn: Date } = await this.loginService.generateAndSaveRefreshToken(
				tokenEntity.user,
				req.ip,
				req.get("User-Agent")
			);

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
}
