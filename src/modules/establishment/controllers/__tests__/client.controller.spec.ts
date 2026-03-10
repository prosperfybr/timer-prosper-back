import "reflect-metadata";
import { ClientController } from "../client.controller";
import { createMockReq, createMockRes, createMockNext } from "@shared/infra/testing/mock-express";
import { HttpStatusCode } from "axios";

describe("ClientController", () => {
	let controller: ClientController;
	let mockFindClient: any, mockInvite: any;

	beforeEach(() => {
		mockFindClient = { findEstablishmentsClient: jest.fn() };
		mockInvite = { establishment: jest.fn(), respond: jest.fn() };
		controller = new ClientController(mockFindClient, mockInvite);
	});

	it("getEstablishmentClients → 200", async () => {
		mockFindClient.findEstablishmentsClient.mockResolvedValue([]);
		const req = createMockReq({ params: { clientId: "c1" } });
		const res = createMockRes();
		await controller.getEstablishmentClients(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});

	it("getEstablishmentClients → next on error", async () => {
		const error = new Error("fail");
		mockFindClient.findEstablishmentsClient.mockRejectedValue(error);
		const req = createMockReq({ params: { clientId: "c1" } });
		const res = createMockRes();
		const next = createMockNext();
		await controller.getEstablishmentClients(req as any, res as any, next);
		expect(next).toHaveBeenCalledWith(error);
	});

	it("addEstablishment → 201", async () => {
		mockInvite.establishment.mockResolvedValue({ id: "inv-1" });
		const req = createMockReq({ body: { code: "ABC", clientId: "c1" } });
		const res = createMockRes();
		await controller.addEstablishment(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Created);
	});

	it("respondInvite → 200", async () => {
		mockInvite.respond.mockResolvedValue({ id: "inv-1" });
		const req = createMockReq({ body: { inviteId: "inv-1", response: "APPROVE" } });
		const res = createMockRes();
		await controller.respondInvite(req as any, res as any, createMockNext());
		expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
	});
});
