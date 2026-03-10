import "reflect-metadata";
import { UpdateAbsenceBlockService } from "../update-absence.service";
import { AbsenceBlockRepository } from "../../repositories/absence-block.repository";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/absence-block.repository");

describe("UpdateAbsenceBlockService", () => {
	let service: UpdateAbsenceBlockService;
	let validatorUtils: jest.Mocked<ValidatorUtils>;

	beforeEach(() => {
		validatorUtils = { filterUpdatedFields: jest.fn() } as any;
		service = new UpdateAbsenceBlockService(validatorUtils);
		jest.clearAllMocks();
	});

	it("should throw if absence not found", async () => {
		(AbsenceBlockRepository.findOne as jest.Mock).mockResolvedValue(null);
		await expect(service.execute({ id: "abs-1" } as any)).rejects.toThrow(BadRequestException);
		await expect(service.execute({ id: "abs-1" } as any)).rejects.toThrow("Ausência não encontrada");
	});

	it("should throw if type is collaborator but no collaboratorId", async () => {
		(AbsenceBlockRepository.findOne as jest.Mock).mockResolvedValue({ id: "abs-1" });
		await expect(service.execute({ id: "abs-1", type: "collaborator", collaboratorId: "" } as any)).rejects.toThrow(
			"Tipo de ausência para colaborador é inválida",
		);
	});

	it("should throw if type is service but no serviceId", async () => {
		(AbsenceBlockRepository.findOne as jest.Mock).mockResolvedValue({ id: "abs-1" });
		await expect(service.execute({ id: "abs-1", type: "service", serviceId: "" } as any)).rejects.toThrow("Tipo de ausência para serviço é inválida");
	});

	it("should throw if nothing to update", async () => {
		(AbsenceBlockRepository.findOne as jest.Mock).mockResolvedValue({ id: "abs-1" });
		validatorUtils.filterUpdatedFields.mockReturnValue({});
		await expect(service.execute({ id: "abs-1", type: "collaborator", collaboratorId: "c1" } as any)).rejects.toThrow(
			"Não há nenhuma informação da ausência para atualizar",
		);
	});

	it("should update absence successfully", async () => {
		const absence = { id: "abs-1" };
		const updatedRaw = { id: "abs-1", establishment_id: "est-1", description: "Updated" };

		(AbsenceBlockRepository.findOne as jest.Mock).mockResolvedValue(absence);
		validatorUtils.filterUpdatedFields.mockReturnValue({ description: "Updated" });

		const mockQb = {
			update: jest.fn().mockReturnThis(),
			set: jest.fn().mockReturnThis(),
			where: jest.fn().mockReturnThis(),
			returning: jest.fn().mockReturnThis(),
			execute: jest.fn().mockResolvedValue({ raw: [updatedRaw] }),
		};
		(AbsenceBlockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQb);

		const result = await service.execute({ id: "abs-1", type: "collaborator", collaboratorId: "c1" } as any);
		expect(result.id).toBe("abs-1");
		expect(result.description).toBe("Updated");
	});
});
