import "reflect-metadata";
import { FindEstablishmentService } from "../find-establishment.service";
import { EstablishmentRepository } from "../../repositories/establishment.repository";
import { UserRepository } from "../../../users/repositories/users.repository";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

// Mocks
jest.mock("../../repositories/establishment.repository");
jest.mock("../../../users/repositories/users.repository");

describe("FindEstablishmentService", () => {
	let findEstablishmentService: FindEstablishmentService;
	let converterUtils: jest.Mocked<ConverterUtils>;

	beforeEach(() => {
		converterUtils = {
			convertCentsToFloat: jest.fn((val) => val / 100),
			convertMinutesInTime: jest.fn(() => "01:00"),
		} as any;

		findEstablishmentService = new FindEstablishmentService(converterUtils);
		jest.clearAllMocks();
	});

	// Mock without services to avoid `this` context loss in Array.map(this.treatData)
	const establishmentSimple = {
		id: "est-123",
		userId: "user-123",
		segmentId: "seg-1",
		tradeName: "Test Est",
		user: null,
		services: null,
		segment: null,
	};

	// Mock with full data for findById (which uses this.treatData() directly)
	const establishmentFull = {
		id: "est-123",
		userId: "user-123",
		segmentId: "seg-1",
		tradeName: "Test Est",
		user: { id: "user-123", email: "test@example.com", role: "CLIENT" },
		services: [{ id: "svc-1", name: "Service 1", description: "Desc", price: 1000, duration: 60 }],
		segment: { id: "seg-1", name: "Barber", isActive: true },
	};

	describe("findById", () => {
		it("should return establishment details if found", async () => {
			(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue(establishmentFull);

			const result = await findEstablishmentService.findById("est-123");

			expect(result.id).toBe("est-123");
			expect(result.services[0].price).toBe(10);
			expect(converterUtils.convertCentsToFloat).toHaveBeenCalledWith(1000);
		});

		it("should throw InvalidArgumentException if ID is missing", async () => {
			await expect(findEstablishmentService.findById("")).rejects.toThrow(InvalidArgumentException);
			await expect(findEstablishmentService.findById("")).rejects.toThrow("O ID do estabelecimento é obrigatório");
		});

		it("should throw BadRequestException if not found", async () => {
			(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue(null);
			await expect(findEstablishmentService.findById("est-123")).rejects.toThrow(BadRequestException);
			await expect(findEstablishmentService.findById("est-123")).rejects.toThrow("Estabelecimento não encontrado");
		});
	});

	describe("findAll", () => {
		it("should return all establishments", async () => {
			(EstablishmentRepository.find as jest.Mock).mockResolvedValue([establishmentSimple]);

			const result = await findEstablishmentService.findAll();

			expect(result).toHaveLength(1);
			expect(result[0].tradeName).toBe("Test Est");
		});

		it("should return empty array if no establishments", async () => {
			(EstablishmentRepository.find as jest.Mock).mockResolvedValue([]);

			const result = await findEstablishmentService.findAll();

			expect(result).toEqual([]);
		});
	});

	describe("findAllByUser", () => {
		it("should return establishments for user", async () => {
			(UserRepository.findUserEstablishments as jest.Mock).mockResolvedValue([establishmentSimple]);

			const result = await findEstablishmentService.findAllByUser("user-123");

			expect(result).toHaveLength(1);
			expect(result[0].userId).toBe("user-123");
		});

		it("should throw InvalidArgumentException if userId is missing", async () => {
			await expect(findEstablishmentService.findAllByUser("")).rejects.toThrow(InvalidArgumentException);
		});
	});

	describe("filterEstablishmentByIdentifier", () => {
		it("should return filtered establishments", async () => {
			(EstablishmentRepository.findAllByIdentifier as jest.Mock).mockResolvedValue([establishmentSimple]);

			const result = await findEstablishmentService.filterEstablishmentByIdentifier("Test");

			expect(result).toHaveLength(1);
		});

		it("should return empty list if identifier is missing", async () => {
			const result = await findEstablishmentService.filterEstablishmentByIdentifier("");
			expect(result).toEqual([]);
		});
	});
});
