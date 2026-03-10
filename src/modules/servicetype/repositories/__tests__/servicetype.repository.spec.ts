import "reflect-metadata";

const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockCreateQueryBuilder = jest.fn();

const mockQB = {
	innerJoin: jest.fn().mockReturnThis(),
	select: jest.fn().mockReturnThis(),
	distinct: jest.fn().mockReturnThis(),
	orderBy: jest.fn().mockReturnThis(),
	getMany: jest.fn(),
};

jest.mock("@config/ormconfig", () => ({
	AppDataSource: {
		getRepository: () => ({
			extend: (methods: any) => {
				const repo = {
					findOne: mockFindOne,
					find: mockFind,
					createQueryBuilder: mockCreateQueryBuilder.mockReturnValue(mockQB),
					...methods,
				};
				Object.keys(methods).forEach((key) => {
					if (typeof methods[key] === "function") repo[key] = methods[key].bind(repo);
				});
				return repo;
			},
		}),
	},
}));

import { ServiceTypeRepository } from "../servicetype.repository";

describe("ServiceTypeRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findById should call findOne with services and segment relations", async () => {
		mockFindOne.mockResolvedValue({ id: "st-1" });
		const result = await ServiceTypeRepository.findById("st-1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { id: "st-1" }, relations: ["services", "segment"] });
		expect(result).toEqual({ id: "st-1" });
	});

	it("findAll should call find with segment relation", async () => {
		mockFind.mockResolvedValue([{ id: "st-1" }]);
		const result = await ServiceTypeRepository.findAll();
		expect(mockFind).toHaveBeenCalledWith({ relations: ["segment"] });
		expect(result).toHaveLength(1);
	});

	it("findByEstablishment should use queryBuilder with innerJoin", async () => {
		mockQB.getMany.mockResolvedValue([{ id: "st-1" }]);
		const result = await ServiceTypeRepository.findByEstablishment("est-1");
		expect(mockCreateQueryBuilder).toHaveBeenCalledWith("serviceType");
		expect(mockQB.innerJoin).toHaveBeenCalled();
		expect(result).toHaveLength(1);
	});

	it("findBySegment should call find with segmentId filter", async () => {
		mockFind.mockResolvedValue([{ id: "st-1" }]);
		const result = await ServiceTypeRepository.findBySegment("seg-1");
		expect(mockFind).toHaveBeenCalledWith({ where: { segmentId: "seg-1" }, relations: ["services", "segment"] });
		expect(result).toHaveLength(1);
	});
});
