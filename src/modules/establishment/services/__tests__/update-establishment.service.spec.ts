import "reflect-metadata";
import { UpdateEstablishmentService } from "../update-establishment.service";
import { EstablishmentRepository } from "../../repositories/establishment.repository";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/establishment.repository");

describe("UpdateEstablishmentService", () => {
	let service: UpdateEstablishmentService;
	let validatorUtils: jest.Mocked<ValidatorUtils>;

	beforeEach(() => {
		validatorUtils = { filterUpdatedFields: jest.fn() } as any;
		service = new UpdateEstablishmentService(validatorUtils);
		jest.clearAllMocks();
	});

	it("should throw if establishment not found", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue(null);
		await expect(service.execute({ id: "est-123" } as any)).rejects.toThrow(BadRequestException);
		await expect(service.execute({ id: "est-123" } as any)).rejects.toThrow("Estabelecimento não encontrado");
	});

	it("should throw if nothing to update", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-123", tradeName: "Old" });
		validatorUtils.filterUpdatedFields.mockReturnValue({});
		await expect(service.execute({ id: "est-123" } as any)).rejects.toThrow("Não há nenhuma informação do estabelecimento para atualizar");
	});

	it("should update establishment successfully", async () => {
		const establishment = { id: "est-123", tradeName: "Old" };
		const updatedRaw = { id: "est-123", trade_name: "New", user_id: "u1" };

		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue(establishment);
		validatorUtils.filterUpdatedFields.mockReturnValue({ tradeName: "New" });

		const mockQb = {
			update: jest.fn().mockReturnThis(),
			set: jest.fn().mockReturnThis(),
			where: jest.fn().mockReturnThis(),
			returning: jest.fn().mockReturnThis(),
			execute: jest.fn().mockResolvedValue({ raw: [updatedRaw] }),
		};
		(EstablishmentRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQb);

		const result = await service.execute({ id: "est-123", tradeName: "New" } as any);
		expect(result.id).toBe("est-123");
		expect(result.tradeName).toBe("New");
	});
});
