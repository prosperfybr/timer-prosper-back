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

import { SegmentRepository } from "../segment.repository";

describe("SegmentRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findById should call findOne with relations", async () => {
		mockFindOne.mockResolvedValue({ id: "seg-1", name: "Beleza" });
		const result = await SegmentRepository.findById("seg-1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { id: "seg-1" }, relations: ["serviceTypes"] });
		expect(result).toEqual({ id: "seg-1", name: "Beleza" });
	});

	it("findAll should call find", async () => {
		mockFind.mockResolvedValue([{ id: "seg-1" }]);
		const result = await SegmentRepository.findAll();
		expect(mockFind).toHaveBeenCalled();
		expect(result).toHaveLength(1);
	});

	it("findAllActive should filter by isActive", async () => {
		mockFind.mockResolvedValue([{ id: "seg-1", isActive: true }]);
		const result = await SegmentRepository.findAllActive();
		expect(mockFind).toHaveBeenCalledWith({ where: { isActive: true } });
		expect(result).toHaveLength(1);
	});
});
