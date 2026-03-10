import "reflect-metadata";
import { SegmentController } from "../segment.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("SegmentController", () => {
	let controller: SegmentController;
	let mockCreate: any, mockFind: any, mockUpdate: any, mockDelete: any;

	beforeEach(() => {
		mockCreate = { execute: jest.fn() };
		mockFind = { findById: jest.fn(), findAll: jest.fn(), findAllActives: jest.fn() };
		mockUpdate = { udpdate: jest.fn() };
		mockDelete = { delete: jest.fn() };
		controller = new SegmentController(mockCreate, mockFind, mockUpdate, mockDelete);
	});

	it("create → 201", async () => {
		mockCreate.execute.mockResolvedValue({ id: "seg-1" });
		const req = createMockReq({ body: { name: "Beleza" } });
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

	it("findById → 200", async () => {
		mockFind.findById.mockResolvedValue({ id: "seg-1" });
		const req = createMockReq({ params: { id: "seg-1" } });
		const res = createMockRes();
		await controller.findById(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("findAll → 200", async () => {
		mockFind.findAll.mockResolvedValue([]);
		const req = createMockReq();
		const res = createMockRes();
		await controller.findAll(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("findActive → 200", async () => {
		mockFind.findAllActives.mockResolvedValue([]);
		const req = createMockReq();
		const res = createMockRes();
		await controller.findActive(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("update → 200", async () => {
		mockUpdate.udpdate.mockResolvedValue(null);
		const req = createMockReq({ body: { id: "seg-1", name: "Updated" } });
		const res = createMockRes();
		await controller.update(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("delete → 200", async () => {
		mockDelete.delete.mockResolvedValue(undefined);
		const req = createMockReq({ params: { id: "seg-1" } });
		const res = createMockRes();
		await controller.delete(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});
});
