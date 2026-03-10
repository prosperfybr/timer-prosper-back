import "reflect-metadata";

const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockCreateQueryBuilder = jest.fn();
const mockQuery = jest.fn();

const mockQB = {
	leftJoinAndSelect: jest.fn().mockReturnThis(),
	leftJoin: jest.fn().mockReturnThis(),
	where: jest.fn().mockReturnThis(),
	orWhere: jest.fn().mockReturnThis(),
	andWhere: jest.fn().mockReturnThis(),
	orderBy: jest.fn().mockReturnThis(),
	getOne: jest.fn(),
	getMany: jest.fn(),
};

jest.mock("@config/ormconfig", () => ({
	AppDataSource: {
		getRepository: () => ({
			extend: (methods: any) => {
				const repo = {
					findOne: mockFindOne,
					find: mockFind,
					query: mockQuery,
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

import { EstablishmentRepository } from "../establishment.repository";

describe("EstablishmentRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findByIdOrCode should call findOne with compound where", async () => {
		mockFindOne.mockResolvedValue({ id: "est-1" });
		const result = await EstablishmentRepository.findByIdOrCode("est-1");
		expect(mockFindOne).toHaveBeenCalledWith(
			expect.objectContaining({
				where: [{ id: "est-1" }, { code: "est-1" }],
				relations: ["user", "services", "segment"],
			}),
		);
		expect(result).toEqual({ id: "est-1" });
	});

	it("findAllByUser should filter by userId", async () => {
		mockFind.mockResolvedValue([{ id: "est-1" }]);
		const result = await EstablishmentRepository.findAllByUser("u1");
		expect(mockFind).toHaveBeenCalledWith({ where: { userId: "u1" } });
		expect(result).toHaveLength(1);
	});

	it("findByOwnerOrCollaborator should use queryBuilder", async () => {
		mockQB.getOne.mockResolvedValue({ id: "est-1" });
		const result = await EstablishmentRepository.findByOwnerOrCollaborator("u1");
		expect(mockCreateQueryBuilder).toHaveBeenCalledWith("establishment");
		expect(result).toEqual({ id: "est-1" });
	});

	it("findBySegment should filter by segmentId with relations", async () => {
		mockFind.mockResolvedValue([{ id: "est-1" }]);
		await EstablishmentRepository.findBySegment("seg-1");
		expect(mockFind).toHaveBeenCalledWith({ where: { segmentId: "seg-1" }, relations: ["user", "segment"] });
	});

	it("findAllByIdentifier should use ILIKE search", async () => {
		mockQB.getMany.mockResolvedValue([{ id: "est-1" }]);
		const result = await EstablishmentRepository.findAllByIdentifier("Shop");
		expect(mockCreateQueryBuilder).toHaveBeenCalledWith("establishment");
		expect(result).toEqual([{ id: "est-1" }]);
	});

	it("findEstablishmentCollaboratorsStats should use raw query", async () => {
		mockQuery.mockResolvedValue([{ total_appointments: "5" }]);
		const result = await EstablishmentRepository.findEstablishmentCollaboratorsStats("u1");
		expect(mockQuery).toHaveBeenCalled();
		expect(result).toHaveLength(1);
	});
});
