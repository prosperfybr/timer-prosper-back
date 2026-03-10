import "reflect-metadata";

const mockFindOne = jest.fn();
const mockFind = jest.fn();

jest.mock("@config/ormconfig", () => ({
	AppDataSource: {
		getRepository: () => ({
			extend: (methods: any) => {
				const repo = { findOne: mockFindOne, find: mockFind, ...methods };
				Object.keys(methods).forEach((key) => {
					if (typeof methods[key] === "function") repo[key] = methods[key].bind(repo);
				});
				return repo;
			},
		}),
	},
}));

import { AbsenceBlockRepository } from "../absence-block.repository";

describe("AbsenceBlockRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findById should call findOne with serviceTypes relation", async () => {
		mockFindOne.mockResolvedValue({ id: "abs-1" });
		const result = await AbsenceBlockRepository.findById("abs-1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { id: "abs-1" }, relations: ["serviceTypes"] });
		expect(result).toEqual({ id: "abs-1" });
	});

	it("findAllByEstablishment should filter by establishmentId", async () => {
		mockFind.mockResolvedValue([{ id: "abs-1" }]);
		const result = await AbsenceBlockRepository.findAllByEstablishment("est-1");
		expect(mockFind).toHaveBeenCalledWith({ where: { establishmentId: "est-1" } });
		expect(result).toHaveLength(1);
	});

	it("findAllByCollaboratorIdAndDate should use MoreThan/LessThan", async () => {
		mockFind.mockResolvedValue([]);
		const result = await AbsenceBlockRepository.findAllByCollaboratorIdAndDate("col-1", "2026-01-01", "2026-01-02");
		expect(mockFind).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ collaboratorId: "col-1" }),
			}),
		);
		expect(result).toEqual([]);
	});

	it("findExisting should filter by all absence params", async () => {
		mockFind.mockResolvedValue([]);
		const result = await AbsenceBlockRepository.findExisting("col-1", "10:00", "12:00", true, 1 as any, null);
		expect(mockFind).toHaveBeenCalled();
		expect(result).toEqual([]);
	});

	it("findByCollaboratorsAndDate should filter by array of ids", async () => {
		mockFind.mockResolvedValue([{ id: "abs-1" }]);
		const result = await AbsenceBlockRepository.findByCollaboratorsAndDate(["col-1", "col-2"], new Date("2026-01-01"), new Date("2026-01-02"), 4);
		expect(mockFind).toHaveBeenCalled();
		expect(result).toHaveLength(1);
	});
});
