import "reflect-metadata";
import { CreateServiceTypeService } from "../create-service-type.service";
import { SegmentRepository } from "../../../segment/repositories/segment.repository";
import { ServiceTypeRepository } from "../../repositories/servicetype.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

jest.mock("../../../segment/repositories/segment.repository");
jest.mock("../../repositories/servicetype.repository");

describe("CreateServiceTypeService", () => {
	let service: CreateServiceTypeService;

	beforeEach(() => {
		service = new CreateServiceTypeService();
		jest.clearAllMocks();
	});

	it("should throw if name is too short", async () => {
		await expect(service.execute({ name: "ab" } as any)).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if description is too short", async () => {
		await expect(service.execute({ name: "Corte", description: "abc" } as any)).rejects.toThrow("A descrição do tipo de serviço é inválida");
	});

	it("should throw if segment not found", async () => {
		(SegmentRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(service.execute({ name: "Corte", segmentId: "seg-1" } as any)).rejects.toThrow("O ID do segmento é inválido");
	});

	it("should create service type successfully", async () => {
		(SegmentRepository.findById as jest.Mock).mockResolvedValue({ id: "seg-1", name: "Beleza" });
		(ServiceTypeRepository.save as jest.Mock).mockResolvedValue({
			id: "st-1",
			name: "Corte",
			description: "Desc",
			segmentId: "seg-1",
		});

		const result = await service.execute({ name: "Corte", description: "Uma descricao", segmentId: "seg-1" } as any);
		expect(result.id).toBe("st-1");
		expect(result.segmentName).toBe("Beleza");
	});
});
