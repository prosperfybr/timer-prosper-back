import "reflect-metadata";
import { ServiceTypeController } from "../servicetype.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("ServiceTypeController", () => {
	let controller: ServiceTypeController;
	let mockCreate: any, mockFind: any, mockUpdate: any, mockDelete: any;

	beforeEach(() => {
		mockCreate = { execute: jest.fn() };
		mockFind = { findById: jest.fn(), findAll: jest.fn(), findByEstablishment: jest.fn(), findBySegment: jest.fn() };
		mockUpdate = { udpdate: jest.fn() };
		mockDelete = { delete: jest.fn() };
		controller = new ServiceTypeController(mockCreate, mockFind, mockUpdate, mockDelete);
	});

	it("create → 201", async () => {
		mockCreate.execute.mockResolvedValue({ id: "st-1" });
		const req = createMockReq({ body: { name: "Corte", segmentId: "seg-1" } });
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
		mockFind.findById.mockResolvedValue({ id: "st-1" });
		const req = createMockReq({ params: { id: "st-1" } });
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

	it("findByEstablishment → 200", async () => {
		mockFind.findByEstablishment.mockResolvedValue([]);
		const req = createMockReq({ params: { establishmentId: "est-1" } });
		const res = createMockRes();
		await controller.findByEstablishment(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("findBySegment → 200", async () => {
		mockFind.findBySegment.mockResolvedValue([]);
		const req = createMockReq({ params: { segmentId: "seg-1" } });
		const res = createMockRes();
		await controller.findBySegment(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("update → 200", async () => {
		mockUpdate.udpdate.mockResolvedValue(null);
		const req = createMockReq({ body: { id: "st-1", name: "Updated" } });
		const res = createMockRes();
		await controller.update(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("delete → 200", async () => {
		mockDelete.delete.mockResolvedValue(undefined);
		const req = createMockReq({ params: { id: "st-1" } });
		const res = createMockRes();
		await controller.delete(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});
});
