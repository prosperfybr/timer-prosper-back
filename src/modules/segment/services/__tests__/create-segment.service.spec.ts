import "reflect-metadata";
import { CreateSegmentService } from "../create-segment.service";
import { SegmentRepository } from "../../repositories/segment.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

jest.mock("../../repositories/segment.repository");

describe("CreateSegmentService", () => {
	let service: CreateSegmentService;

	beforeEach(() => {
		service = new CreateSegmentService();
		jest.clearAllMocks();
	});

	it("should throw if name is too short", async () => {
		await expect(service.execute({ name: "ab", active: true } as any)).rejects.toThrow(InvalidArgumentException);
	});

	it("should create segment successfully", async () => {
		(SegmentRepository.save as jest.Mock).mockResolvedValue({ id: "seg-1", name: "Beleza", isActive: true });
		const result = await service.execute({ name: "Beleza", active: true } as any);
		expect(result.id).toBe("seg-1");
		expect(result.name).toBe("Beleza");
		expect(result.active).toBe(true);
	});

	it("should default active to false if not provided", async () => {
		(SegmentRepository.save as jest.Mock).mockResolvedValue({ id: "seg-1", name: "Saúde", isActive: false });
		const result = await service.execute({ name: "Saúde" } as any);
		expect(result.active).toBe(false);
	});
});
