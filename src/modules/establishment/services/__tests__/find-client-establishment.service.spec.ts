import "reflect-metadata";
import { FindClientEstablishmentService } from "../find-client-establishment.service";
import { ClientEstablishmentRepository } from "../../repositories/client-establishment.repository";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/client-establishment.repository");

describe("FindClientEstablishmentService", () => {
	let service: FindClientEstablishmentService;
	let formatterUtils: jest.Mocked<FormatterUtils>;

	beforeEach(() => {
		formatterUtils = { addCPFMask: jest.fn((v) => "***." + v.slice(3)) } as any;
		service = new FindClientEstablishmentService(formatterUtils);
		jest.clearAllMocks();
	});

	describe("findClientsEstablishment", () => {
		it("should throw if establishmentId is invalid", async () => {
			await expect(service.findClientsEstablishment("")).rejects.toThrow(BadRequestException);
			await expect(service.findClientsEstablishment("")).rejects.toThrow("O ID do estabelecimento é obrigatório");
		});

		it("should return empty array if no clients", async () => {
			(ClientEstablishmentRepository.findAllByEstablishment as jest.Mock).mockResolvedValue([]);
			// uuid validate will fail for non-uuid strings, so we use a proper UUID format
			const validUUID = "550e8400-e29b-41d4-a716-446655440000";
			const result = await service.findClientsEstablishment(validUUID);
			expect(result).toEqual([]);
		});
	});

	describe("findEstablishmentsClient", () => {
		it("should throw if clientId is missing", async () => {
			await expect(service.findEstablishmentsClient("")).rejects.toThrow(BadRequestException);
			await expect(service.findEstablishmentsClient("")).rejects.toThrow("O ID do cliente é obrigatório");
		});

		it("should return empty array if no establishments", async () => {
			(ClientEstablishmentRepository.findAllByUser as jest.Mock).mockResolvedValue([]);
			const result = await service.findEstablishmentsClient("client-1");
			expect(result).toEqual([]);
		});

		it("should return formatted establishments for client", async () => {
			const clientEstablishments = [
				{
					id: "ce-1",
					userId: "u1",
					establishmentId: "est-1",
					status: "APPROVED",
					requestedBy: "CLIENT",
					requestedAt: new Date(),
					approvedAt: new Date(),
				},
			];
			(ClientEstablishmentRepository.findAllByUser as jest.Mock).mockResolvedValue(clientEstablishments);

			const result = await service.findEstablishmentsClient("client-1");
			expect(result).toHaveLength(1);
			expect(result[0].id).toBe("ce-1");
		});
	});
});
