import "reflect-metadata";
import { InviteService } from "../invite.service";
import { ClientEstablishmentRepository } from "../../repositories/client-establishment.repository";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ClientRequestStatusEnum } from "../../models/enums/client-request-status.enum";
import { ClientRequestByEnum } from "../../models/enums/client-request-by.enum";

jest.mock("../../repositories/client-establishment.repository");
jest.mock("@shared/utils/email-service.util", () => ({
	EmailService: {
		sendEmail: jest.fn(),
		buildEmailPayload: jest.fn(),
	},
	WebhookEmailType: {
		CONVITE_CLIENTE: "CONVITE_CLIENTE",
		CLIENTE_SOLICITANDO_VINCULO: "CLIENTE_SOLICITANDO_VINCULO",
	},
}));

describe("InviteService", () => {
	let service: InviteService;

	beforeEach(() => {
		service = new InviteService();
		jest.clearAllMocks();
	});

	describe("client (establishment inviting client)", () => {
		it("should throw if establishmentId missing", async () => {
			await expect(service.client({ clientEmail: "a@b.com", establishmentId: "" } as any)).rejects.toThrow("O ID do estabelecimento é obrigatório");
		});

		it("should throw if clientEmail missing", async () => {
			await expect(service.client({ clientEmail: "", establishmentId: "est-1" } as any)).rejects.toThrow("O e-mail do cliente é obrigatório");
		});

		it("should throw if establishment not found", async () => {
			(ClientEstablishmentRepository.findInviteByClientAndEstablishment as jest.Mock).mockResolvedValue({ establishment: null, client: null });
			await expect(service.client({ clientEmail: "a@b.com", establishmentId: "est-1" } as any)).rejects.toThrow("Estabelecimento não encontrado");
		});

		it("should throw if client already invited", async () => {
			(ClientEstablishmentRepository.findInviteByClientAndEstablishment as jest.Mock).mockResolvedValue({
				establishment: { tradeName: "Est" },
				client: { id: "c1" },
			});
			await expect(service.client({ clientEmail: "a@b.com", establishmentId: "est-1" } as any)).rejects.toThrow("O cliente já foi convidado");
		});

		it("should create invite successfully", async () => {
			const inviteCreated = {
				id: "inv-1",
				userId: null,
				establishmentId: "est-1",
				clientEmail: "a@b.com",
				status: ClientRequestStatusEnum.PENDING,
				requestedBy: ClientRequestByEnum.ESTABLISHMENT,
			};
			(ClientEstablishmentRepository.findInviteByClientAndEstablishment as jest.Mock).mockResolvedValue({
				establishment: { tradeName: "Est" },
				client: null,
			});
			(ClientEstablishmentRepository.create as jest.Mock).mockReturnValue(inviteCreated);
			(ClientEstablishmentRepository.save as jest.Mock).mockResolvedValue(inviteCreated);

			const result = await service.client({ clientEmail: "a@b.com", establishmentId: "est-1" } as any);
			expect(result.id).toBe("inv-1");
			expect(result.status).toBe(ClientRequestStatusEnum.PENDING);
		});
	});

	describe("respond", () => {
		it("should throw if inviteId missing", async () => {
			await expect(service.respond({ inviteId: "", approve: true } as any)).rejects.toThrow("O ID do convite é obrigatório");
		});

		it("should throw if approve is null", async () => {
			await expect(service.respond({ inviteId: "inv-1", approve: null } as any)).rejects.toThrow("A aprovação ou rejeição do convite é obrigatória");
		});

		it("should throw if invite not found", async () => {
			(ClientEstablishmentRepository.findById as jest.Mock).mockResolvedValue(null);
			await expect(service.respond({ inviteId: "inv-1", approve: true } as any)).rejects.toThrow("Convite não encontrado");
		});

		it("should approve invite", async () => {
			const invite = { id: "inv-1", status: ClientRequestStatusEnum.PENDING };
			(ClientEstablishmentRepository.findById as jest.Mock).mockResolvedValue(invite);
			(ClientEstablishmentRepository.update as jest.Mock).mockResolvedValue({});

			const result = await service.respond({ inviteId: "inv-1", approve: true } as any);
			expect(result.status).toBe(ClientRequestStatusEnum.APPROVED);
		});

		it("should reject invite", async () => {
			const invite = { id: "inv-2", status: ClientRequestStatusEnum.PENDING };
			(ClientEstablishmentRepository.findById as jest.Mock).mockResolvedValue(invite);
			(ClientEstablishmentRepository.update as jest.Mock).mockResolvedValue({});

			const result = await service.respond({ inviteId: "inv-2", approve: false } as any);
			expect(result.status).toBe(ClientRequestStatusEnum.REJECTED);
		});
	});
});
