import "reflect-metadata";

const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockQuery = jest.fn();

jest.mock("@config/ormconfig", () => ({
	AppDataSource: {
		getRepository: () => ({
			extend: (methods: any) => {
				const repo = { findOne: mockFindOne, find: mockFind, query: mockQuery, ...methods };
				Object.keys(methods).forEach((key) => {
					if (typeof methods[key] === "function") repo[key] = methods[key].bind(repo);
				});
				return repo;
			},
		}),
	},
}));

import { ClientEstablishmentRepository } from "../client-establishment.repository";

describe("ClientEstablishmentRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findById should call findOne with user and establishment relations", async () => {
		mockFindOne.mockResolvedValue({ id: "ce-1" });
		const result = await ClientEstablishmentRepository.findById("ce-1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { id: "ce-1" }, relations: ["user", "establishment"] });
		expect(result).toEqual({ id: "ce-1" });
	});

	it("findAllByEstablishment should filter by establishmentId", async () => {
		mockFind.mockResolvedValue([{ id: "ce-1" }]);
		const result = await ClientEstablishmentRepository.findAllByEstablishment("est-1");
		expect(mockFind).toHaveBeenCalledWith({ where: { establishmentId: "est-1" }, relations: ["establishment", "user"] });
		expect(result).toHaveLength(1);
	});

	it("findAllByUser should filter by userId", async () => {
		mockFind.mockResolvedValue([{ id: "ce-1" }]);
		await ClientEstablishmentRepository.findAllByUser("u1");
		expect(mockFind).toHaveBeenCalledWith({ where: { userId: "u1" } });
	});

	it("findByUserId should call findOne", async () => {
		mockFindOne.mockResolvedValue({ id: "ce-1" });
		await ClientEstablishmentRepository.findByUserId("u1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { userId: "u1" } });
	});

	it("findInviteByClientAndEstablishment should use raw query", async () => {
		mockQuery.mockResolvedValue([{ client: { id: "u1" }, establishment: { id: "est-1" } }]);
		const result = await ClientEstablishmentRepository.findInviteByClientAndEstablishment("email@test.com", "est-1");
		expect(mockQuery).toHaveBeenCalled();
		expect(result).toHaveProperty("client");
	});
});
