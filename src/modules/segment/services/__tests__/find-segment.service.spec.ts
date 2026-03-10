import "reflect-metadata";
import { FindSegmentService } from "../find-segment.service";
import { SegmentRepository } from "../../repositories/segment.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/segment.repository");

describe("FindSegmentService", () => {
	let service: FindSegmentService;

	beforeEach(() => {
		service = new FindSegmentService();
		jest.clearAllMocks();
	});

	describe("findById", () => {
		it("should throw if id is missing", async () => {
			await expect(service.findById("")).rejects.toThrow(InvalidArgumentException);
		});

		it("should throw if segment not found", async () => {
			(SegmentRepository.findById as jest.Mock).mockResolvedValue(null);
			await expect(service.findById("seg-1")).rejects.toThrow(BadRequestException);
		});

		it("should return segment DTO", async () => {
			(SegmentRepository.findById as jest.Mock).mockResolvedValue({ id: "seg-1", name: "Beleza", isActive: true });
			const result = await service.findById("seg-1");
			expect(result.id).toBe("seg-1");
			expect(result.active).toBe(true);
		});
	});

	describe("findAllActives", () => {
		it("should throw if no active segments", async () => {
			(SegmentRepository.findAllActive as jest.Mock).mockResolvedValue([]);
			await expect(service.findAllActives()).rejects.toThrow("Sem segmentos ativos cadastrados");
		});

		it("should return active segments", async () => {
			(SegmentRepository.findAllActive as jest.Mock).mockResolvedValue([{ id: "seg-1", name: "Beleza", isActive: true }]);
			const result = await service.findAllActives();
			expect(result).toHaveLength(1);
		});
	});

	describe("findAll", () => {
		it("should throw if no segments", async () => {
			(SegmentRepository.findAll as jest.Mock).mockResolvedValue([]);
			await expect(service.findAll()).rejects.toThrow("Sem segmentos cadastrados");
		});

		it("should return all segments", async () => {
			(SegmentRepository.findAll as jest.Mock).mockResolvedValue([
				{ id: "seg-1", name: "Beleza", isActive: true },
				{ id: "seg-2", name: "Saúde", isActive: false },
			]);
			const result = await service.findAll();
			expect(result).toHaveLength(2);
		});
	});
});
