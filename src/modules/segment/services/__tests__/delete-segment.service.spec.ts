import "reflect-metadata";
import { DeleteSegmentService } from "../delete-segment.service";
import { SegmentRepository } from "../../repositories/segment.repository";
import { EstablishmentRepository } from "../../../establishment/repositories/establishment.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/segment.repository");
jest.mock("../../../establishment/repositories/establishment.repository");

describe("DeleteSegmentService", () => {
	let service: DeleteSegmentService;

	beforeEach(() => {
		service = new DeleteSegmentService();
		jest.clearAllMocks();
	});

	it("should throw if id is missing", async () => {
		await expect(service.delete("")).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if segment not found", async () => {
		(SegmentRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(service.delete("seg-1")).rejects.toThrow("Segmento não encontrado");
	});

	it("should throw if segment has associated establishments", async () => {
		(SegmentRepository.findById as jest.Mock).mockResolvedValue({ id: "seg-1" });
		(EstablishmentRepository.findBySegment as jest.Mock).mockResolvedValue([{ id: "est-1" }]);
		await expect(service.delete("seg-1")).rejects.toThrow("Não é possível excluir este segmento");
	});

	it("should delete segment successfully", async () => {
		(SegmentRepository.findById as jest.Mock).mockResolvedValue({ id: "seg-1" });
		(EstablishmentRepository.findBySegment as jest.Mock).mockResolvedValue([]);
		(SegmentRepository.delete as jest.Mock).mockResolvedValue({});
		await service.delete("seg-1");
		expect(SegmentRepository.delete).toHaveBeenCalledWith("seg-1");
	});
});
