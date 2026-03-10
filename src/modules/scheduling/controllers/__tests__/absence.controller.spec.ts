import "reflect-metadata";
import { AbsenceController } from "../absence.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("AbsenceController", () => {
	let controller: AbsenceController;
	let mockCreate: any, mockFind: any, mockDelete: any, mockUpdate: any;

	beforeEach(() => {
		mockCreate = { execute: jest.fn() };
		mockFind = { find: jest.fn() };
		mockDelete = { execute: jest.fn() };
		mockUpdate = { execute: jest.fn() };
		controller = new AbsenceController(mockCreate, mockFind, mockDelete, mockUpdate);
	});

	it("create → 201", async () => {
		mockCreate.execute.mockResolvedValue({ id: "abs-1" });
		const req = createMockReq({ body: { establishmentId: "est-1", type: "collaborator" } });
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

	it("update → 201", async () => {
		mockUpdate.execute.mockResolvedValue({ id: "abs-1" });
		const req = createMockReq({ body: { id: "abs-1", reason: "Updated" } });
		const res = createMockRes();
		await controller.update(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Created);
	});

	it("find → 200", async () => {
		mockFind.find.mockResolvedValue([]);
		const req = createMockReq({ params: { establishmentId: "est-1" } });
		const res = createMockRes();
		await controller.find(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("delete → 200", async () => {
		mockDelete.execute.mockResolvedValue(undefined);
		const req = createMockReq({ params: { id: "abs-1" } });
		const res = createMockRes();
		await controller.delete(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});
});
