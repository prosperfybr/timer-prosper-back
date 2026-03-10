import "reflect-metadata";
import { LoginController } from "../login.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("LoginController", () => {
	let controller: LoginController;
	let mockLoginService: any;

	beforeEach(() => {
		mockLoginService = {
			doLogin: jest.fn(),
			validateRefreshToken: jest.fn(),
			generateAccessToken: jest.fn(),
			revokeRefreshToken: jest.fn(),
			generateAndSaveRefreshToken: jest.fn(),
			logout: jest.fn(),
		};
		controller = new LoginController(mockLoginService);
	});

	describe("login", () => {
		it("should return 200 with token on success", async () => {
			const loginResponse = {
				token: "jwt-token",
				refreshToken: "rf-token",
				type: "Bearer",
				expiresIn: 3600,
				refreshExpiresIn: new Date(),
				user: { id: "u1", name: "Test", establishments: [], password: "hash" },
				establishment: { id: "est-1" },
			};
			mockLoginService.doLogin.mockResolvedValue(loginResponse);
			const req = createMockReq({ body: { email: "a@b.com", password: "123" } });
			const res = createMockRes();
			const next = createMockNext();

			await controller.login(req as any, res as any, next);

			expect(res.cookie).toHaveBeenCalledWith("refreshToken", "rf-token", expect.any(Object));
			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ accessToken: "jwt-token" }) }));
		});

		it("should call next on error", async () => {
			const error = new Error("invalid credentials");
			mockLoginService.doLogin.mockRejectedValue(error);
			const req = createMockReq({ body: {} });
			const res = createMockRes();
			const next = createMockNext();

			await controller.login(req as any, res as any, next);
			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("refresh", () => {
		it("should return 200 with new token", async () => {
			const user = { id: "u1", email: "a@b.com" };
			mockLoginService.validateRefreshToken.mockResolvedValue({ user });
			mockLoginService.generateAccessToken.mockReturnValue({ token: "new-jwt", expiresIn: 3600 });
			mockLoginService.revokeRefreshToken.mockResolvedValue(undefined);
			mockLoginService.generateAndSaveRefreshToken.mockResolvedValue({ refreshToken: "new-rf", expiresIn: new Date() });

			const req = createMockReq({ cookies: { refreshToken: "old-rf" } });
			const res = createMockRes();
			const next = createMockNext();

			await controller.getUser(req as any, res as any, next);

			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ accessToken: "new-jwt" }) }));
		});

		it("should return 403 if token entity has no user", async () => {
			mockLoginService.validateRefreshToken.mockResolvedValue({ user: null });
			const req = createMockReq({ cookies: { refreshToken: "old-rf" } });
			const res = createMockRes();
			const next = createMockNext();

			await controller.getUser(req as any, res as any, next);

			expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
			expect(res.status).toHaveBeenCalledWith(403);
		});

		it("should call next if no refresh token in cookies", async () => {
			const req = createMockReq({ cookies: {} });
			const res = createMockRes();
			const next = createMockNext();

			await controller.getUser(req as any, res as any, next);
			expect(next).toHaveBeenCalled();
		});
	});

	describe("logout", () => {
		it("should return 200 on logout", async () => {
			mockLoginService.logout.mockResolvedValue(undefined);
			const req = createMockReq();
			const res = createMockRes();
			const next = createMockNext();

			await controller.logout(req as any, res as any, next);
			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
		});
	});
});
