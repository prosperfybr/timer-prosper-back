import "reflect-metadata";
import { EstablishmentController } from "../establishment.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("EstablishmentController", () => {
	let controller: EstablishmentController;
	let mockCreate: any, mockFind: any, mockDelete: any, mockUpdate: any, mockFindClient: any, mockInvite: any;

	beforeEach(() => {
		mockCreate = { execute: jest.fn() };
		mockFind = { findById: jest.fn(), findAll: jest.fn(), findAllByUser: jest.fn(), filterEstablishmentByIdentifier: jest.fn() };
		mockDelete = { delete: jest.fn() };
		mockUpdate = { execute: jest.fn() };
		mockFindClient = { findClientsEstablishment: jest.fn() };
		mockInvite = { client: jest.fn(), respond: jest.fn() };
		controller = new EstablishmentController(mockCreate, mockFind, mockDelete, mockUpdate, mockFindClient, mockInvite);
	});

	it("create → 201", async () => {
		const payload = { id: "est-1" };
		mockCreate.execute.mockResolvedValue(payload);
		const req = createMockReq({ body: { tradeName: "Shop" } });
		const res = createMockRes();
		const next = createMockNext();
		await controller.create(req as any, res as any, next);
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

	it("findEstablishmentById → 200", async () => {
		mockFind.findById.mockResolvedValue({ id: "est-1" });
		const req = createMockReq({ params: { id: "est-1" } });
		const res = createMockRes();
		await controller.findEstablishmentById(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("findAllEstablishments → 200", async () => {
		mockFind.findAll.mockResolvedValue([]);
		const req = createMockReq();
		const res = createMockRes();
		await controller.findAllEstablishments(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("findAllOwnerEstablishments → 200", async () => {
		mockFind.findAllByUser.mockResolvedValue([]);
		const req = createMockReq();
		const res = createMockRes();
		await controller.findAllOwnerEstablishments(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("filterEstablishments → 200", async () => {
		mockFind.filterEstablishmentByIdentifier.mockResolvedValue([]);
		const req = createMockReq({ query: { code: "ABC" } });
		const res = createMockRes();
		await controller.filterEstablishments(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("getEstablishmentClients → 200", async () => {
		mockFindClient.findClientsEstablishment.mockResolvedValue([]);
		const req = createMockReq({ params: { establishmentId: "est-1" } });
		const res = createMockRes();
		await controller.getEstablishmentClients(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("delete → 200", async () => {
		mockDelete.delete.mockResolvedValue(undefined);
		const req = createMockReq({ params: { id: "est-1" } });
		const res = createMockRes();
		await controller.delete(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("update → 200", async () => {
		mockUpdate.execute.mockResolvedValue({ id: "est-1" });
		const req = createMockReq({ body: { id: "est-1", tradeName: "Updated" } });
		const res = createMockRes();
		await controller.update(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("addClient → 201", async () => {
		mockInvite.client.mockResolvedValue({ id: "invite-1" });
		const req = createMockReq({ body: { clientEmail: "a@b.com", establishmentId: "est-1" } });
		const res = createMockRes();
		await controller.addClient(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Created);
	});

	it("respondInvite → 200", async () => {
		mockInvite.respond.mockResolvedValue({ id: "invite-1", status: "approved" });
		const req = createMockReq({ body: { inviteId: "invite-1", response: "APPROVE" } });
		const res = createMockRes();
		await controller.respondInvite(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});
});
