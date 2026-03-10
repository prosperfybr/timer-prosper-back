import "reflect-metadata";
import { UserController } from "../users.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("UserController", () => {
	let controller: UserController;
	let mockCreateUserService: any;
	let mockFindUserService: any;
	let mockUpdateUserService: any;
	let mockDeleteUserService: any;
	let mockFindUserPreferencesService: any;
	let mockUpdateUserPreferencesService: any;

	beforeEach(() => {
		mockCreateUserService = { execute: jest.fn() };
		mockFindUserService = { getUser: jest.fn(), getAllUsers: jest.fn(), getAdminStats: jest.fn() };
		mockUpdateUserService = { execute: jest.fn() };
		mockDeleteUserService = { execute: jest.fn() };
		mockFindUserPreferencesService = { getPreferences: jest.fn() };
		mockUpdateUserPreferencesService = { execute: jest.fn() };
		controller = new UserController(
			mockCreateUserService,
			mockFindUserService,
			mockUpdateUserService,
			mockDeleteUserService,
			mockFindUserPreferencesService,
			mockUpdateUserPreferencesService,
		);
	});

	describe("create", () => {
		it("should return 201 on success", async () => {
			const payload = { id: "u1", name: "Test" };
			mockCreateUserService.execute.mockResolvedValue(payload);
			const req = createMockReq({ body: { name: "Test", email: "a@b.com", password: "123" } });
			const res = createMockRes();
			const next = createMockNext();

			await controller.create(req as any, res as any, next);

			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Created);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ payload }));
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			mockCreateUserService.execute.mockRejectedValue(error);
			const req = createMockReq();
			const res = createMockRes();
			const next = createMockNext();

			await controller.create(req as any, res as any, next);
			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("getUser", () => {
		it("should return 200 with user", async () => {
			const user = { id: "u1", name: "Test" };
			mockFindUserService.getUser.mockResolvedValue(user);
			const req = createMockReq();
			const res = createMockRes();
			const next = createMockNext();

			await controller.getUser(req as any, res as any, next);

			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ payload: user }));
		});
	});

	describe("getAllUsers", () => {
		it("should return 200 with users list", async () => {
			mockFindUserService.getAllUsers.mockResolvedValue([]);
			const req = createMockReq();
			const res = createMockRes();
			const next = createMockNext();

			await controller.getAllUsers(req as any, res as any, next);
			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
		});
	});

	describe("getUserPreferences", () => {
		it("should return 200 with preferences", async () => {
			const prefs = { theme: "dark" };
			mockFindUserPreferencesService.getPreferences.mockResolvedValue(prefs);
			const req = createMockReq();
			const res = createMockRes();
			const next = createMockNext();

			await controller.getUserPreferences(req as any, res as any, next);
			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ payload: prefs }));
		});
	});

	describe("getAdminStats", () => {
		it("should return 200 with stats", async () => {
			mockFindUserService.getAdminStats.mockResolvedValue({ totalUsers: 10 });
			const req = createMockReq();
			const res = createMockRes();
			const next = createMockNext();

			await controller.getAdminStats(req as any, res as any, next);
			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
		});
	});

	describe("update", () => {
		it("should return 200 on update", async () => {
			const updated = { id: "u1", name: "Updated" };
			mockUpdateUserService.execute.mockResolvedValue(updated);
			const req = createMockReq({ body: { name: "Updated" } });
			const res = createMockRes();
			const next = createMockNext();

			await controller.update(req as any, res as any, next);
			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
		});
	});

	describe("updateOtherUser", () => {
		it("should return 200 on admin update", async () => {
			const updated = { id: "u1", name: "Updated" };
			mockUpdateUserService.execute.mockResolvedValue(updated);
			const req = createMockReq({ body: { name: "Updated", userId: "u2" } });
			const res = createMockRes();
			const next = createMockNext();

			await controller.updateOtherUser(req as any, res as any, next);
			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
		});
	});

	describe("updatePreferences", () => {
		it("should return 200 on preferences update", async () => {
			mockUpdateUserPreferencesService.execute.mockResolvedValue({ theme: "light" });
			const req = createMockReq({ body: { theme: "light" } });
			const res = createMockRes();
			const next = createMockNext();

			await controller.updatePreferences(req as any, res as any, next);
			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
		});
	});

	describe("delete", () => {
		it("should return 200 on delete", async () => {
			mockDeleteUserService.execute.mockResolvedValue(undefined);
			const req = createMockReq({ params: { id: "u1" } });
			const res = createMockRes();
			const next = createMockNext();

			await controller.delete(req as any, res as any, next);
			expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
		});

		it("should call next on error", async () => {
			const error = new Error("not found");
			mockDeleteUserService.execute.mockRejectedValue(error);
			const req = createMockReq({ params: { id: "u1" } });
			const res = createMockRes();
			const next = createMockNext();

			await controller.delete(req as any, res as any, next);
			expect(next).toHaveBeenCalledWith(error);
		});
	});
});
