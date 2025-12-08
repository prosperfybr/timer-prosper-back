import { log } from "@config/Logger";
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
import { RolesEnum } from "@modules/users/models/enum/roles.enum";
import { EstablishmentRepository } from "@modules/establishment/repositories/establishment.repository";
import { CollaboratorRepository } from "@modules/collaborators/repositories/collaborator.repository";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";

@Service()
export class LoginService {
	constructor(
		//- Repositories
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly userRepository: UserRepository,
		private readonly establishmentRepository: EstablishmentRepository,
		private readonly collaboratorRepository: CollaboratorRepository
	) {}

	public async doLogin(payload: DoLoginDTO, clientIp?: string, userAgent?: string): Promise<LoginResponseDTO> {
		log.info(`Initializing login for user [${payload.email}]`);
		const { email, password } = payload;

		if (!email || email.trim().length === 0 || !password || password.trim().length === 0) {
			log.error("Username or password is empty");
			throw new UnauthorizedException("Usuário ou senha incorretos");
		}

		const user: UserEntity = await this.userRepository.findByEmail(email);

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
			admin: async (userId: string): Promise<string> => {return;},
			proprietario: async (userId: string) => {
				const establishment: EstablishmentEntity = await this.establishmentRepository.findByOwnerOrCollaborator(userId);
				return !establishment ? null : establishment.id;
			},
			colaborador: async (userId: string) => {
				const establishment: EstablishmentEntity = await this.establishmentRepository.findByOwnerOrCollaborator(userId);
				return !establishment ? null : establishment.id;
			},
			cliente: async (userId: string) => { return; },
		};

		const establishmentId: string | void = await finder[user.role](user.id);
		return {
			token: accessToken,
			refreshToken: refreshToken,
			type: "Bearer",
			expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY}m`,
			refreshExpiresIn,
			user: user,
			establishmentId
		} as LoginResponseDTO;
	}

	public hashToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}

	public generateAccessToken(user: UserEntity): { token: string; expiresIn: number } {
		const payload = { id: user.id, role: user.role };
		const accessTokenExpiry: number = process.env.ACCESS_TOKEN_EXPIRY ? parseInt(process.env.ACCESS_TOKEN_EXPIRY) : 15;
		return {
			token: jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiry, subject: user.id }),
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

		await this.refreshTokenRepository.save(refreshToken);

		return { refreshToken: token, expiresIn: expiresAt };
	}

	public async validateRefreshToken(rawToken: string): Promise<RefreshTokenEntity> {
		const tokenHash = this.hashToken(rawToken);

		const token = await this.refreshTokenRepository.findByTokenHash(tokenHash);

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
		await this.refreshTokenRepository.save(token);
	}
}
