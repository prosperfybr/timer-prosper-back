import "reflect-metadata";
import { ServicesController } from "../services.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("ServicesController", () => {
	let controller: ServicesController;
	let mockCreate: any, mockFind: any, mockUpdate: any, mockDelete: any;

	beforeEach(() => {
		mockCreate = { execute: jest.fn() };
		mockFind = { findServiceById: jest.fn(), findService: jest.fn() };
		mockUpdate = { execute: jest.fn() };
		mockDelete = { delete: jest.fn() };
		controller = new ServicesController(mockCreate, mockFind, mockUpdate, mockDelete);
	});

	it("create → 201", async () => {
		mockCreate.execute.mockResolvedValue({ id: "svc-1" });
		const req = createMockReq({ body: { name: "Corte" } });
		const res = createMockRes();
		await controller.create(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Created);
	});

	it("create → next on error", async () => {
		const error = new Error("fail");
		mockCreate.execute.mockRejectedValue(error);
		const req = createMockReq();
		const res = createMockRes();
		const next = createMockNext();
		await controller.create(req as any, res as any, next);
		expect(next).toHaveBeenCalledWith(error);
	});

	it("find → 200", async () => {
		mockFind.findServiceById.mockResolvedValue({ id: "svc-1" });
		const req = createMockReq({ params: { id: "svc-1" } });
		const res = createMockRes();
		await controller.find(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("filter → 200", async () => {
		mockFind.findService.mockResolvedValue({ data: [], total: 0 });
		const req = createMockReq({ query: { establishmentId: "est-1" } });
		const res = createMockRes();
		await controller.filter(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("update → 200", async () => {
		mockUpdate.execute.mockResolvedValue(undefined);
		const req = createMockReq({ body: { id: "svc-1", name: "Updated" } });
		const res = createMockRes();
		await controller.update(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("delete → 200", async () => {
		mockDelete.delete.mockResolvedValue(undefined);
		const req = createMockReq({ params: { id: "svc-1" } });
		const res = createMockRes();
		await controller.delete(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("deleteMany → 200", async () => {
		mockDelete.delete.mockResolvedValue(undefined);
		const req = createMockReq({ params: { ids: "svc-1,svc-2" } });
		const res = createMockRes();
		await controller.deletMany(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});
});
