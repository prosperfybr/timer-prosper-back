import "reflect-metadata";
import { SchedulingController } from "../scheduling.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("SchedulingController", () => {
	let controller: SchedulingController;
	let mockCreate: any, mockFind: any, mockCancel: any;

	beforeEach(() => {
		mockCreate = { execute: jest.fn() };
		mockFind = { findAvailableSlots: jest.fn(), findAllClientScheduling: jest.fn() };
		mockCancel = { execute: jest.fn() };
		controller = new SchedulingController(mockCreate, mockFind, mockCancel);
	});

	it("create → 201", async () => {
		mockCreate.execute.mockResolvedValue({ id: "sch-1" });
		const req = createMockReq({ body: { collaboratorId: "c1", date: "2026-01-01" } });
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

	it("findById (slots) → 200", async () => {
		mockFind.findAvailableSlots.mockResolvedValue([]);
		const req = createMockReq({
			params: { establishmentId: "est-1", serviceId: "svc-1", collaboratorId: "c1", date: "2026-01-01" },
		});
		const res = createMockRes();
		await controller.findById(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
		expect(mockFind.findAvailableSlots).toHaveBeenCalledWith("est-1", "2026-01-01", "svc-1", "c1");
	});

	it("findAll (client scheduling) → 200", async () => {
		mockFind.findAllClientScheduling.mockResolvedValue([]);
		const req = createMockReq({ params: { id: "u1" } });
		const res = createMockRes();
		await controller.findAll(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("delete → 200", async () => {
		mockCancel.execute.mockResolvedValue(undefined);
		const req = createMockReq({ params: { id: "sch-1" } });
		const res = createMockRes();
		await controller.delete(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});
});
