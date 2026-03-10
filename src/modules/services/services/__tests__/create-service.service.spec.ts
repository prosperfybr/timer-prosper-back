import "reflect-metadata";
import { CreateServiceService } from "../create-service.service";
import { ServicesRepository } from "../../repositories/services.repository";
import { ServiceTypeRepository } from "../../../servicetype/repositories/servicetype.repository";
import { EstablishmentRepository } from "../../../establishment/repositories/establishment.repository";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/services.repository");
jest.mock("../../../servicetype/repositories/servicetype.repository");
jest.mock("../../../establishment/repositories/establishment.repository");

describe("CreateServiceService", () => {
	let service: CreateServiceService;
	let converterUtils: jest.Mocked<ConverterUtils>;

	beforeEach(() => {
		converterUtils = {
			convertCentsToFloat: jest.fn((v) => v / 100),
			convertMinutesInTime: jest.fn((v) => `${v}min`),
		} as any;
		service = new CreateServiceService(converterUtils);
		jest.clearAllMocks();
	});

	it("should throw if name is too short", async () => {
		await expect(service.execute({ name: "ab", description: "desc ok", price: 100, duration: 30 } as any)).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if description is too short", async () => {
		await expect(service.execute({ name: "Corte", description: "abc", price: 100, duration: 30 } as any)).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if price is zero or negative", async () => {
		await expect(service.execute({ name: "Corte", description: "descricao ok", price: 0, duration: 30 } as any)).rejects.toThrow(BadRequestException);
	});

	it("should throw if duration is 0", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue({ id: "st-1" });
		await expect(
			service.execute({
				name: "Corte",
				description: "Uma descricao",
				price: 100,
				duration: 0,
				serviceTypeId: "st-1",
				establishmentId: "est-1",
			} as any),
		).rejects.toThrow("O tempo de execução do serviço é inválido");
	});

	it("should throw if service type not found", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(
			service.execute({
				name: "Corte",
				description: "Uma descricao",
				price: 100,
				duration: 30,
				serviceTypeId: "st-1",
				establishmentId: "est-1",
			} as any),
		).rejects.toThrow("Tipo de serviço não encontrado");
	});

	it("should throw if establishment not found", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue({ id: "st-1" });
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue(null);
		await expect(
			service.execute({
				name: "Corte",
				description: "Uma descricao",
				price: 100,
				duration: 30,
				serviceTypeId: "st-1",
				establishmentId: "est-1",
			} as any),
		).rejects.toThrow("Estabelecimento não encontrado");
	});

	it("should create service successfully", async () => {
		(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue({ id: "st-1" });
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		(ServicesRepository.save as jest.Mock).mockResolvedValue({
			id: "svc-1",
			name: "Corte",
			description: "Desc",
			price: 5000,
			duration: 30,
		});

		const result = await service.execute({
			name: "Corte",
			description: "Uma descricao",
			price: 5000,
			duration: 30,
			serviceTypeId: "st-1",
			establishmentId: "est-1",
		} as any);

		expect(result.id).toBe("svc-1");
		expect(result.name).toBe("Corte");
		expect(converterUtils.convertCentsToFloat).toHaveBeenCalledWith(5000);
		expect(converterUtils.convertMinutesInTime).toHaveBeenCalledWith(30);
	});
});
