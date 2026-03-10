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

import { UserPreferencesRepository } from "../user-preferences.repository";

describe("UserPreferencesRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findByUserId should call findOne with userId", async () => {
		mockFindOne.mockResolvedValue({ id: "pref-1", userId: "u1" });
		const result = await UserPreferencesRepository.findByUserId("u1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { userId: "u1" } });
		expect(result).toEqual({ id: "pref-1", userId: "u1" });
	});

	it("findById should call findOne with id", async () => {
		mockFindOne.mockResolvedValue({ id: "pref-1" });
		const result = await UserPreferencesRepository.findById("pref-1");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { id: "pref-1" } });
		expect(result).toEqual({ id: "pref-1" });
	});
});
