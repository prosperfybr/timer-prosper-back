import "reflect-metadata";
import { EstablishmentHourController } from "../establishment-hour.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("EstablishmentHourController", () => {
	let controller: EstablishmentHourController;
	let mockCreate: any, mockFind: any, mockDelete: any;

	beforeEach(() => {
		mockCreate = { execute: jest.fn() };
		mockFind = { execute: jest.fn() };
		mockDelete = { execute: jest.fn() };
		controller = new EstablishmentHourController(mockCreate, mockFind, mockDelete);
	});

	it("create → 201", async () => {
		mockCreate.execute.mockResolvedValue(undefined);
		const req = createMockReq({ body: { establishmentId: "est-1", hours: [] } });
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

	it("findAllEstablishments → 200", async () => {
		mockFind.execute.mockResolvedValue({ hours: [] });
		const req = createMockReq({ params: { establishmentId: "est-1" } });
		const res = createMockRes();
		await controller.findAllEstablishments(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("delete → 200", async () => {
		mockDelete.execute.mockResolvedValue(undefined);
		const req = createMockReq({ params: { id: "hour-1" } });
		const res = createMockRes();
		await controller.delete(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});
});
