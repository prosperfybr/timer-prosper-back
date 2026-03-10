import "reflect-metadata";
import { FindServiceService } from "../find-service.service";
import { ServicesRepository } from "../../repositories/services.repository";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/services.repository");

describe("FindServiceService", () => {
	let service: FindServiceService;
	let converterUtils: jest.Mocked<ConverterUtils>;

	beforeEach(() => {
		converterUtils = {
			convertCentsToFloat: jest.fn((v) => v / 100),
			convertMinutesInTime: jest.fn((v) => `${v}min`),
		} as any;
		service = new FindServiceService(converterUtils);
		jest.clearAllMocks();
	});

	describe("findServiceById", () => {
		it("should throw if ID is missing", async () => {
			await expect(service.findServiceById("")).rejects.toThrow(BadRequestException);
		});

		it("should throw if service not found", async () => {
			(ServicesRepository.findById as jest.Mock).mockResolvedValue(null);
			await expect(service.findServiceById("svc-1")).rejects.toThrow("Serviço não encontrado");
		});

		it("should return service response DTO", async () => {
			(ServicesRepository.findById as jest.Mock).mockResolvedValue({
				id: "svc-1",
				name: "Corte",
				description: "Test",
				price: 5000,
				duration: 30,
			});

			const result = await service.findServiceById("svc-1");
			expect(result.id).toBe("svc-1");
			expect(converterUtils.convertCentsToFloat).toHaveBeenCalledWith(5000);
		});
	});

	describe("findServiceByIds", () => {
		it("should throw if ids array is empty", async () => {
			await expect(service.findServiceByIds([])).rejects.toThrow(BadRequestException);
		});

		it("should return empty if no services found", async () => {
			(ServicesRepository.find as jest.Mock).mockResolvedValue([]);
			const result = await service.findServiceByIds(["svc-1"]);
			expect(result).toEqual([]);
		});

		it("should return mapped services", async () => {
			(ServicesRepository.find as jest.Mock).mockResolvedValue([{ id: "svc-1", name: "Corte", description: "Test", price: 3000, duration: 45 }]);

			const result = await service.findServiceByIds(["svc-1"]);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe("Corte");
		});
	});

	describe("findService (paginated)", () => {
		it("should return paginated results with default limit", async () => {
			(ServicesRepository.findAndCount as jest.Mock).mockResolvedValue([[{ id: "svc-1", name: "Corte" }], 1]);

			const result = await service.findService({ establishmentId: "est-1" } as any);
			expect(result.meta.totalItems).toBe(1);
			expect(result.meta.currentPage).toBe(1);
			expect(result.meta.itemsPerPage).toBe(10);
			expect(result.data).toHaveLength(1);
		});

		it("should apply custom page and limit", async () => {
			(ServicesRepository.findAndCount as jest.Mock).mockResolvedValue([[], 0]);

			const result = await service.findService({ page: "2", limit: "5" } as any);
			expect(result.meta.currentPage).toBe(2);
			expect(result.meta.itemsPerPage).toBe(5);
		});
	});
});
