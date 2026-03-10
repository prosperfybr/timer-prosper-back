import "reflect-metadata";
import { FindAbsenceBlockService } from "../find-absence.service";
import { AbsenceBlockRepository } from "../../repositories/absence-block.repository";
import { AbsenceBlockResponse } from "../../models/dto/absence-block-response.dto";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

jest.mock("../../repositories/absence-block.repository");

describe("FindAbsenceBlockService", () => {
	let service: FindAbsenceBlockService;
	let mapper: jest.Mocked<AbsenceBlockResponse>;

	beforeEach(() => {
		mapper = { toDto: jest.fn() } as any;
		service = new FindAbsenceBlockService(mapper);
		jest.clearAllMocks();
	});

	it("should throw if establishmentId is missing", async () => {
		await expect(service.find("")).rejects.toThrow(InvalidArgumentException);
		await expect(service.find("")).rejects.toThrow("ID do estabelecimento obrigatório");
	});

	it("should return empty array if no absences", async () => {
		(AbsenceBlockRepository.findAllByEstablishment as jest.Mock).mockResolvedValue([]);
		const result = await service.find("est-1");
		expect(result).toEqual([]);
	});

	it("should return mapped absences", async () => {
		const absences = [{ id: "abs-1" }];
		const mapped = [{ id: "abs-1", description: "Test" }];
		(AbsenceBlockRepository.findAllByEstablishment as jest.Mock).mockResolvedValue(absences);
		mapper.toDto.mockResolvedValue(mapped as any);

		const result = await service.find("est-1");
		expect(result).toEqual(mapped);
		expect(mapper.toDto).toHaveBeenCalledWith(absences);
	});
});
