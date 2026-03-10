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

import { ServicesRepository } from "../services.repository";

describe("ServicesRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findById should call findOne with relations", async () => {
		mockFindOne.mockResolvedValue({ id: "svc-1", name: "Corte" });
		const result = await ServicesRepository.findById("svc-1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { id: "svc-1" }, relations: ["serviceType", "establishment"] });
		expect(result).toEqual({ id: "svc-1", name: "Corte" });
	});

	it("findByIds should call find with In operator", async () => {
		mockFind.mockResolvedValue([{ id: "svc-1" }, { id: "svc-2" }]);
		const result = await ServicesRepository.findByIds(["svc-1", "svc-2"]);
		expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ relations: ["establishment", "serviceType"] }));
		expect(result).toHaveLength(2);
	});
});
