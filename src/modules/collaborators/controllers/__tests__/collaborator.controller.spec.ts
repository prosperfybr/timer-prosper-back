import "reflect-metadata";
import { CollaboratorController } from "../collaborator.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("CollaboratorController", () => {
	let controller: CollaboratorController;
	let mockCreate: any, mockFind: any, mockUpdate: any, mockDelete: any;

	beforeEach(() => {
		mockCreate = { execute: jest.fn() };
		mockFind = { execute: jest.fn(), getAllEstablishmentCollaborators: jest.fn(), getCollaboratorStats: jest.fn() };
		mockUpdate = { execute: jest.fn(), toggleStatus: jest.fn() };
		mockDelete = { execute: jest.fn() };
		controller = new CollaboratorController(mockCreate, mockFind, mockUpdate, mockDelete);
	});

	it("create → 201", async () => {
		mockCreate.execute.mockResolvedValue({ id: "col-1" });
		const req = createMockReq({ body: { userId: "u1", establishmentId: "est-1" } });
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

	it("getCollaborator → 200", async () => {
		mockFind.execute.mockResolvedValue({ id: "col-1" });
		const req = createMockReq({ params: { collaboratorId: "col-1" } });
		const res = createMockRes();
		await controller.getCollaborator(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("getAllEstablishmentCollaborators → 200 for owner", async () => {
		mockFind.getAllEstablishmentCollaborators.mockResolvedValue([]);
		const req = createMockReq({ params: { establishmentId: "est-1" }, user: { id: "u1", role: "owner" } });
		const res = createMockRes();
		await controller.getAllEstablishmentCollaborators(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("getAllEstablishmentCollaborators → early return for non-owner without establishmentId", async () => {
		const req = createMockReq({ params: { establishmentId: "undefined" }, user: { id: "u1", role: "colaborador" } });
		const res = createMockRes();
		await controller.getAllEstablishmentCollaborators(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
		expect(mockFind.getAllEstablishmentCollaborators).not.toHaveBeenCalled();
	});

	it("update → 200", async () => {
		mockUpdate.execute.mockResolvedValue({ id: "col-1" });
		const req = createMockReq({ body: { id: "col-1", specialty: "Hair" } });
		const res = createMockRes();
		await controller.update(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("toggleStatus → 200", async () => {
		mockUpdate.toggleStatus.mockResolvedValue(undefined);
		const req = createMockReq({ params: { collaboratorId: "col-1" } });
		const res = createMockRes();
		await controller.toggleStatus(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("delete → 200", async () => {
		mockDelete.execute.mockResolvedValue(undefined);
		const req = createMockReq({ params: { id: "col-1" } });
		const res = createMockRes();
		await controller.delete(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("getCollaboratorStats → 200", async () => {
		mockFind.getCollaboratorStats.mockResolvedValue({ appointmentsToday: 5 });
		const req = createMockReq({ params: { collaboratorId: "col-1" } });
		const res = createMockRes();
		await controller.getCollaboratorStats(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});
});
