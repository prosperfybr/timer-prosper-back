import "reflect-metadata";

const mockFindOne = jest.fn();

jest.mock("@config/ormconfig", () => ({
	AppDataSource: {
		getRepository: () => ({
			extend: (methods: any) => {
				const repo = { findOne: mockFindOne, ...methods };
				Object.keys(methods).forEach((key) => {
					if (typeof methods[key] === "function") repo[key] = methods[key].bind(repo);
				});
				return repo;
			},
		}),
	},
}));

import { RefreshTokenRepository } from "../refresh-token.repository";

describe("RefreshTokenRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findByTokenHash should call findOne with hash and user relation", async () => {
		const token = { id: "rt-1", tokenHash: "abc123", user: { id: "u1" } };
		mockFindOne.mockResolvedValue(token);
		const result = await RefreshTokenRepository.findByTokenHash("abc123");
		expect(mockFindOne).toHaveBeenCalledWith({ where: { tokenHash: "abc123" }, relations: ["user"] });
		expect(result).toEqual(token);
	});

	it("findByTokenHash should return null if not found", async () => {
		mockFindOne.mockResolvedValue(null);
		const result = await RefreshTokenRepository.findByTokenHash("nonexistent");
		expect(result).toBeNull();
	});
});
