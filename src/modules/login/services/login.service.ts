import { log } from "@config/Logger";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { UserEntity } from "@modules/users/models/entity/user.entity";
import { UserRepository } from "@modules/users/repositories/users.repository";
import { Service } from "@shared/decorators/service.decorator";
import { UnauthorizedException } from "@shared/exceptions/UnauthorizedException";
import { compare } from "bcryptjs";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { DoLoginDTO } from "../models/dto/do-login.dto";
import { LoginResponseDTO } from "../models/dto/login-response.dto";
import { RefreshTokenEntity } from "../models/entity/refresh-token.entity";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";

@Service()
export class LoginService {
	constructor() {}

	public async doLogin(payload: DoLoginDTO, clientIp?: string, userAgent?: string): Promise<LoginResponseDTO> {
		log.info(`Initializing login for user [${payload.email}]`);
		const { email, password } = payload;

		if (!email || email.trim().length === 0 || !password || password.trim().length === 0) {
			log.error("Username or password is empty");
			throw new UnauthorizedException("Usuário ou senha incorretos");
		}

		const user: UserEntity = await UserRepository.findByEmail(email);

		if (!user) {
			log.error(`User not found by email [${email}]`);
			throw new UnauthorizedException("Usuário ou senha incorretos");
		}

		const passwordMatch: boolean = await compare(password, user.password);
		if (!passwordMatch) throw new UnauthorizedException("Usuário ou senha incorretos");

		const { token: accessToken }: { token: string; expiresIn: number } = this.generateAccessToken(user);
		const { refreshToken, expiresIn: refreshExpiresIn }: { refreshToken: string; expiresIn: Date } = await this.generateAndSaveRefreshToken(
			user,
			clientIp,
			userAgent,
		);

		/* FIND A ESTABLISHMENT ATTACHED FOR THIS USER */
		const finder = {
			admin: async (userId: string): Promise<void> => {},
			proprietario: async (userId: string): Promise<EstablishmentEntity> => {
				const establishment: EstablishmentEntity = await EstablishmentRepository.findByOwnerOrCollaborator(userId);
				return !establishment ? null : establishment;
			},
			colaborador: async (userId: string): Promise<EstablishmentEntity> => {
				const establishment: EstablishmentEntity = await EstablishmentRepository.findByOwnerOrCollaborator(userId);
				return !establishment ? null : establishment;
			},
			cliente: async (userId: string): Promise<void> => {}
		};

		const establishment: EstablishmentEntity | void = await finder[user.role](user.id);
		return {
			token: accessToken,
			refreshToken: refreshToken,
			type: "Bearer",
			expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY}m`,
			refreshExpiresIn,
			user: user,
			establishment,
		} as LoginResponseDTO;
	}

	public hashToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}

	public generateAccessToken(user: UserEntity): { token: string; expiresIn: number } {
		const payload = { id: user.id, role: user.role };
		const accessTokenExpiry: number = process.env.ACCESS_TOKEN_EXPIRY ? parseInt(process.env.ACCESS_TOKEN_EXPIRY) : 15;
		return {
			token: jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${accessTokenExpiry}m`, subject: user.id }),
			expiresIn: accessTokenExpiry,
		};
	}

	public async generateAndSaveRefreshToken(
		user: UserEntity,
		clientIp?: string,
		userAgent?: string,
	): Promise<{ refreshToken: string; expiresIn: Date }> {
		const token = crypto.randomBytes(32).toString("hex");
		const tokenHash: string = this.hashToken(token);

		const expiresAt: Date = new Date();
		const refreshTokenExpiryDays: number = process.env.REFRESH_TOKEN_EXPIRY_DAYS ? parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS) : 7;
		expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiryDays);

		const refreshToken: RefreshTokenEntity = new RefreshTokenEntity();
		refreshToken.tokenHash = tokenHash;
		refreshToken.userId = user.id;
		refreshToken.expiresAt = expiresAt;
		refreshToken.clientIp = clientIp || null;
		refreshToken.userAgent = userAgent || null;
		refreshToken.isRevoked = false;
		refreshToken.user = user;

		await RefreshTokenRepository.save(refreshToken);

		return { refreshToken: token, expiresIn: expiresAt };
	}

	public async validateRefreshToken(rawToken: string): Promise<RefreshTokenEntity> {
		const tokenHash = this.hashToken(rawToken);

		const token = await RefreshTokenRepository.findByTokenHash(tokenHash);

		if (!token) return null;
		if (token.isRevoked) return null;
		if (token.expiresAt < new Date()) {
			this.revokeRefreshToken(token);
			return null;
		}

		return token;
	}

	public async revokeRefreshToken(token: RefreshTokenEntity): Promise<void> {
		token.isRevoked = true;
		await RefreshTokenRepository.save(token);
	}

	public async logout(id: string): Promise<void> {
		await RefreshTokenRepository.delete(id);
	}
}
