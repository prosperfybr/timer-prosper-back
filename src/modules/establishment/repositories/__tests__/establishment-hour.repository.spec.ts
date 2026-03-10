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

import { EstablishmentHourRepository } from "../establishment-hour.repository";

describe("EstablishmentHourRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findById should call findOne with establishment relation", async () => {
		mockFindOne.mockResolvedValue({ id: "h1" });
		const result = await EstablishmentHourRepository.findById("h1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { id: "h1" }, relations: ["establishment"] });
		expect(result).toEqual({ id: "h1" });
	});

	it("findAllByEstablishment should call find with establishmentId", async () => {
		mockFind.mockResolvedValue([{ id: "h1" }, { id: "h2" }]);
		const result = await EstablishmentHourRepository.findAllByEstablishment("est-1");
		expect(mockFind).toHaveBeenCalledWith({ where: { establishmentId: "est-1" }, relations: ["establishment"] });
		expect(result).toHaveLength(2);
	});
});
