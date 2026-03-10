import "reflect-metadata";
import { FindServiceTypeService } from "../find-service-type.service";
import { ServiceTypeRepository } from "../../repositories/servicetype.repository";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/servicetype.repository");

describe("FindServiceTypeService", () => {
	let service: FindServiceTypeService;
	let converterUtils: jest.Mocked<ConverterUtils>;

	beforeEach(() => {
		converterUtils = {
			convertCentsToFloat: jest.fn((v) => v / 100),
			convertMinutesInTime: jest.fn((v) => `${v}min`),
		} as any;
		service = new FindServiceTypeService(converterUtils);
		jest.clearAllMocks();
	});

	describe("findById", () => {
		it("should throw if id is missing", async () => {
			await expect(service.findById("")).rejects.toThrow(InvalidArgumentException);
		});

		it("should throw if not found", async () => {
			(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue(null);
			await expect(service.findById("st-1")).rejects.toThrow(BadRequestException);
		});

		it("should return service type with mapped services", async () => {
			(ServiceTypeRepository.findById as jest.Mock).mockResolvedValue({
				id: "st-1",
				name: "Corte",
				description: "Desc",
				segment: { id: "seg-1", name: "Beleza" },
				services: [{ id: "svc-1", name: "Tesoura", description: "Desc", price: 3000, duration: 30 }],
			});

			const result = await service.findById("st-1");
			expect(result.id).toBe("st-1");
			expect(result.services).toHaveLength(1);
			expect(converterUtils.convertCentsToFloat).toHaveBeenCalledWith(3000);
		});
	});

	describe("findByEstablishment", () => {
		it("should throw if establishmentId is missing", async () => {
			await expect(service.findByEstablishment("")).rejects.toThrow(InvalidArgumentException);
		});

		it("should throw if no service types found", async () => {
			(ServiceTypeRepository.findByEstablishment as jest.Mock).mockResolvedValue([]);
			await expect(service.findByEstablishment("est-1")).rejects.toThrow(BadRequestException);
		});

		it("should return service types by establishment", async () => {
			(ServiceTypeRepository.findByEstablishment as jest.Mock).mockResolvedValue([
				{ id: "st-1", name: "Corte", description: "Desc", segment: { id: "seg-1", name: "Beleza" } },
			]);
			const result = await service.findByEstablishment("est-1");
			expect(result).toHaveLength(1);
		});
	});

	describe("findBySegment", () => {
		it("should throw if segmentId is missing", async () => {
			await expect(service.findBySegment("")).rejects.toThrow(InvalidArgumentException);
		});

		it("should throw if no service types found", async () => {
			(ServiceTypeRepository.findBySegment as jest.Mock).mockResolvedValue([]);
			await expect(service.findBySegment("seg-1")).rejects.toThrow(BadRequestException);
		});
	});

	describe("findAll", () => {
		it("should throw if no service types", async () => {
			(ServiceTypeRepository.findAll as jest.Mock).mockResolvedValue([]);
			await expect(service.findAll()).rejects.toThrow("Sem tipos de serviços cadastrados");
		});

		it("should return all service types", async () => {
			(ServiceTypeRepository.findAll as jest.Mock).mockResolvedValue([
				{ id: "st-1", name: "Corte", description: "D", segment: { id: "seg-1", name: "Beleza" } },
			]);
			const result = await service.findAll();
			expect(result).toHaveLength(1);
		});
	});
});
