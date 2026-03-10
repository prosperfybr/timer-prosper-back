import "reflect-metadata";
import { DeleteServiceTypeService } from "../delete-service-type.service";
import { ServiceTypeRepository } from "../../repositories/servicetype.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/servicetype.repository");

describe("DeleteServiceTypeService", () => {
	let service: DeleteServiceTypeService;

	beforeEach(() => {
		service = new DeleteServiceTypeService();
		jest.clearAllMocks();
	});

	it("should throw if id is missing", async () => {
		await expect(service.delete("")).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if service type not found", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(service.delete("st-1")).rejects.toThrow("Tipo de serviço não encontrado");
	});

	it("should throw if service type has associated services", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue({ id: "st-1", services: [{ id: "svc-1" }] });
		await expect(service.delete("st-1")).rejects.toThrow("Não é possível excluir este tipo de serviço");
	});

	it("should delete service type successfully", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue({ id: "st-1", services: [] });
		(ServiceTypeRepository.delete as jest.Mock).mockResolvedValue({});
		await service.delete("st-1");
		expect(ServiceTypeRepository.delete).toHaveBeenCalledWith("st-1");
	});
});
