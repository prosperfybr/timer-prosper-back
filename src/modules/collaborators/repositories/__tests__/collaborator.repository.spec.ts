import "reflect-metadata";

const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockCreateQueryBuilder = jest.fn();
const mockQuery = jest.fn();

const mockQB = {
	where: jest.fn().mockReturnThis(),
	andWhere: jest.fn().mockReturnThis(),
	innerJoinAndSelect: jest.fn().mockReturnThis(),
	getRawMany: jest.fn(),
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

import { CollaboratorRepository } from "../collaborator.repository";

describe("CollaboratorRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findAllByEstablishmentId should filter by establishmentId", async () => {
		mockFind.mockResolvedValue([{ id: "col-1" }]);
		const result = await CollaboratorRepository.findAllByEstablishmentId("est-1");
		expect(mockFind).toHaveBeenCalledWith({ where: { establishmentId: "est-1" } });
		expect(result).toHaveLength(1);
	});

	it("findByUserId should call findOne with userId", async () => {
		mockFindOne.mockResolvedValue({ id: "col-1", userId: "u1" });
		const result = await CollaboratorRepository.findByUserId("u1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { userId: "u1" } });
		expect(result).toEqual({ id: "col-1", userId: "u1" });
	});

	it("findCollaboratorInformations should use queryBuilder with joins", async () => {
		mockQB.getRawMany.mockResolvedValue([{ collaborator_id: "col-1" }]);
		const result = await CollaboratorRepository.findCollaboratorInformations("col-1");
		expect(mockCreateQueryBuilder).toHaveBeenCalledWith("collaborator");
		expect(mockQB.where).toHaveBeenCalledWith("collaborator.id = :collaboratorId", { collaboratorId: "col-1" });
		expect(result).toHaveLength(1);
	});

	it("findCollaboratorInformations should return empty array if no results", async () => {
		mockQB.getRawMany.mockResolvedValue([]);
		const result = await CollaboratorRepository.findCollaboratorInformations("col-1");
		expect(result).toEqual([]);
	});

	it("findEstablishmentCollaborators should use queryBuilder", async () => {
		mockQB.getRawMany.mockResolvedValue([{ collaborator_id: "col-1" }]);
		const result = await CollaboratorRepository.findEstablishmentCollaborators("est-1");
		expect(result).toHaveLength(1);
	});

	it("findCollaboratorStats should use raw SQL query", async () => {
		mockQuery.mockResolvedValue([{ total_appointments: "3" }]);
		const result = await CollaboratorRepository.findCollaboratorStats("col-1");
		expect(mockQuery).toHaveBeenCalled();
		expect(result).toHaveLength(1);
	});

	it("findCollaboratorsInEstablishentWorksInService should use queryBuilder with optional collaboratorId", async () => {
		mockQB.getMany.mockResolvedValue([{ id: "col-1" }]);
		const result = await CollaboratorRepository.findCollaboratorsInEstablishentWorksInService("est-1", "svc-1", null);
		expect(mockCreateQueryBuilder).toHaveBeenCalledWith("collaborator");
		expect(result).toHaveLength(1);
	});
});
