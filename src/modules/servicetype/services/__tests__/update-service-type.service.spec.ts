import "reflect-metadata";
import { UpdateServiceTypeService } from "../update-service-type.service";
import { ServiceTypeRepository } from "../../repositories/servicetype.repository";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/servicetype.repository");

describe("UpdateServiceTypeService", () => {
	let service: UpdateServiceTypeService;
	let validatorUtils: jest.Mocked<ValidatorUtils>;

	beforeEach(() => {
		validatorUtils = { filterUpdatedFields: jest.fn() } as any;
		service = new UpdateServiceTypeService(validatorUtils);
		jest.clearAllMocks();
	});

	it("should throw if service type not found", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(service.udpdate({ id: "st-1" } as any)).rejects.toThrow("Tipo de serviço não encontrado");
	});

	it("should throw if nothing to update", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue({ id: "st-1" });
		validatorUtils.filterUpdatedFields.mockReturnValue({});
		await expect(service.udpdate({ id: "st-1", name: "Same" } as any)).rejects.toThrow("Não há nenhuma informação do tipo de serviço para atualizar");
	});

	it("should update service type successfully", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue({ id: "st-1" });
		validatorUtils.filterUpdatedFields.mockReturnValue({ name: "Updated" });
		(ServiceTypeRepository.update as jest.Mock).mockResolvedValue({});
		const result = await service.udpdate({ id: "st-1", name: "Updated" } as any);
		expect(ServiceTypeRepository.update).toHaveBeenCalledWith("st-1", { name: "Updated" });
		expect(result).toBeNull();
	});
});
