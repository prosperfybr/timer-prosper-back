import "reflect-metadata";
import { UpdateSegmentService } from "../update-segment.service";
import { SegmentRepository } from "../../repositories/segment.repository";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/segment.repository");

describe("UpdateSegmentService", () => {
	let service: UpdateSegmentService;
	let validatorUtils: jest.Mocked<ValidatorUtils>;

	beforeEach(() => {
		validatorUtils = { filterUpdatedFields: jest.fn() } as any;
		service = new UpdateSegmentService(validatorUtils);
		jest.clearAllMocks();
	});

	it("should throw if segment not found", async () => {
		(SegmentRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(service.udpdate({ id: "seg-1" } as any)).rejects.toThrow("Segmento não encontrado");
	});

	it("should throw if nothing to update", async () => {
		(SegmentRepository.findById as jest.Mock).mockResolvedValue({ id: "seg-1" });
		validatorUtils.filterUpdatedFields.mockReturnValue({});
		await expect(service.udpdate({ id: "seg-1", name: "Same" } as any)).rejects.toThrow("Não há nenhuma informação do segmento para atualizar");
	});

	it("should update segment successfully", async () => {
		(SegmentRepository.findById as jest.Mock).mockResolvedValue({ id: "seg-1" });
		validatorUtils.filterUpdatedFields.mockReturnValue({ name: "Updated" });
		(SegmentRepository.update as jest.Mock).mockResolvedValue({});
		const result = await service.udpdate({ id: "seg-1", name: "Updated" } as any);
		expect(SegmentRepository.update).toHaveBeenCalledWith("seg-1", { name: "Updated" });
		expect(result).toBeNull();
	});
});
