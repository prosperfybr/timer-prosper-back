import "reflect-metadata";
import { LoginService } from "../login.service";
import { UserRepository } from "../../../users/repositories/users.repository";
import { EstablishmentRepository } from "../../../establishment/repositories/establishment.repository";
import { RefreshTokenRepository } from "../../repositories/refresh-token.repository";
import { UnauthorizedException } from "@shared/exceptions/UnauthorizedException";
import * as bcryptjs from "bcryptjs";

jest.mock("../../../users/repositories/users.repository");
jest.mock("../../../establishment/repositories/establishment.repository");
jest.mock("../../repositories/refresh-token.repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken", () => ({
	sign: jest.fn().mockReturnValue("mock-jwt-token"),
}));

describe("LoginService", () => {
	let service: LoginService;

	beforeEach(() => {
		service = new LoginService();
		jest.clearAllMocks();
		process.env.ACCESS_TOKEN_SECRET = "test-secret";
		process.env.ACCESS_TOKEN_EXPIRY = "15";
	});

	it("should throw if email is empty", async () => {
		await expect(service.doLogin({ email: "", password: "pass" } as any)).rejects.toThrow(UnauthorizedException);
	});

	it("should throw if password is empty", async () => {
		await expect(service.doLogin({ email: "test@test.com", password: "" } as any)).rejects.toThrow(UnauthorizedException);
	});

	it("should throw if user not found", async () => {
		(UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
		await expect(service.doLogin({ email: "test@test.com", password: "pass" } as any)).rejects.toThrow("Usuário ou senha incorretos");
	});

	it("should throw if password does not match", async () => {
		(UserRepository.findByEmail as jest.Mock).mockResolvedValue({ id: "u1", password: "hash", role: "cliente" });
		(bcryptjs.compare as jest.Mock).mockResolvedValue(false);
		await expect(service.doLogin({ email: "test@test.com", password: "wrong" } as any)).rejects.toThrow("Usuário ou senha incorretos");
	});

	it("should login successfully", async () => {
		const user = { id: "u1", email: "test@test.com", password: "hash", role: "cliente" };
		(UserRepository.findByEmail as jest.Mock).mockResolvedValue(user);
		(bcryptjs.compare as jest.Mock).mockResolvedValue(true);
		(RefreshTokenRepository.save as jest.Mock).mockResolvedValue({});

		const result = await service.doLogin({ email: "test@test.com", password: "pass" } as any);
		expect(result.token).toBe("mock-jwt-token");
		expect(result.type).toBe("Bearer");
		expect(result.user).toBe(user);
	});

	describe("validateRefreshToken", () => {
		it("should return null if token not found", async () => {
			(RefreshTokenRepository.findByTokenHash as jest.Mock).mockResolvedValue(null);
			const result = await service.validateRefreshToken("some-token");
			expect(result).toBeNull();
		});

		it("should return null if token is revoked", async () => {
			(RefreshTokenRepository.findByTokenHash as jest.Mock).mockResolvedValue({ isRevoked: true });
			const result = await service.validateRefreshToken("some-token");
			expect(result).toBeNull();
		});
	});

	it("should logout by deleting token", async () => {
		(RefreshTokenRepository.delete as jest.Mock).mockResolvedValue({});
		await service.logout("token-id");
		expect(RefreshTokenRepository.delete).toHaveBeenCalledWith("token-id");
	});
});
