import "reflect-metadata";
import { UpdateServiceService } from "../update-service.service";
import { ServicesRepository } from "../../repositories/services.repository";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/services.repository");

describe("UpdateServiceService", () => {
	let service: UpdateServiceService;
	let validatorUtils: jest.Mocked<ValidatorUtils>;

	beforeEach(() => {
		validatorUtils = { filterUpdatedFields: jest.fn() } as any;
		service = new UpdateServiceService(validatorUtils);
		jest.clearAllMocks();
	});

	it("should throw if service not found", async () => {
		(ServicesRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(service.execute({ id: "svc-1" } as any)).rejects.toThrow("Serviço não encontrado");
	});

	it("should throw if nothing to update", async () => {
		(ServicesRepository.findById as jest.Mock).mockResolvedValue({ id: "svc-1", name: "Corte" });
		validatorUtils.filterUpdatedFields.mockReturnValue({});
		await expect(service.execute({ id: "svc-1", name: "Corte" } as any)).rejects.toThrow("Não há nenhuma informação do serviço para atualizar");
	});

	it("should update service successfully", async () => {
		(ServicesRepository.findById as jest.Mock).mockResolvedValue({ id: "svc-1", name: "Corte" });
		validatorUtils.filterUpdatedFields.mockReturnValue({ name: "Corte Premium" });
		(ServicesRepository.update as jest.Mock).mockResolvedValue({});

		const result = await service.execute({ id: "svc-1", name: "Corte Premium" } as any);
		expect(ServicesRepository.update).toHaveBeenCalledWith("svc-1", { name: "Corte Premium" });
		expect(result).toBeNull();
	});
});
