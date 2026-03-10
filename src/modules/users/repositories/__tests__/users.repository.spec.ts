import "reflect-metadata";

// Mock ormconfig before importing repository
const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockCreateQueryBuilder = jest.fn();
const mockQuery = jest.fn();
const mockRelation = jest.fn();

const mockQB = {
	leftJoinAndSelect: jest.fn().mockReturnThis(),
	where: jest.fn().mockReturnThis(),
	select: jest.fn().mockReturnThis(),
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
					createQueryBuilder: mockCreateQueryBuilder.mockReturnValue(mockQB),
					query: mockQuery,
					relation: mockRelation,
					...methods,
				};
				// Bind 'this' for extended methods
				Object.keys(methods).forEach((key) => {
					if (typeof methods[key] === "function") {
						repo[key] = methods[key].bind(repo);
					}
				});
				return repo;
			},
		}),
	},
}));

import { UserRepository } from "../users.repository";

describe("UserRepository", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCreateQueryBuilder.mockReturnValue(mockQB);
	});

	describe("findById", () => {
		it("should use queryBuilder with left join on establishments", async () => {
			mockQB.getOne.mockResolvedValue({ id: "u1", name: "Test" });
			const result = await UserRepository.findById("u1");
			expect(mockCreateQueryBuilder).toHaveBeenCalledWith("user");
			expect(mockQB.leftJoinAndSelect).toHaveBeenCalledWith("user.establishments", "establishments");
			expect(mockQB.where).toHaveBeenCalledWith("user.id = :id", { id: "u1" });
			expect(result).toEqual({ id: "u1", name: "Test" });
		});
	});

	describe("findByEmail", () => {
		it("should use queryBuilder with left join on preferences", async () => {
			mockQB.getOne.mockResolvedValue({ id: "u1", email: "a@b.com" });
			const result = await UserRepository.findByEmail("a@b.com");
			expect(mockQB.leftJoinAndSelect).toHaveBeenCalledWith("user.preferences", "preferences");
			expect(mockQB.where).toHaveBeenCalledWith("user.email = :email", { email: "a@b.com" });
			expect(result).toEqual({ id: "u1", email: "a@b.com" });
		});
	});

	describe("findUserNameByUserId", () => {
		it("should select only user name", async () => {
			mockQB.getOne.mockResolvedValue({ name: "Test" });
			const result = await UserRepository.findUserNameByUserId("u1");
			expect(mockQB.select).toHaveBeenCalledWith(["user.name"]);
			expect(result).toEqual({ name: "Test" });
		});
	});

	describe("findUserEstablishments", () => {
		it("should use relation loader", async () => {
			const mockLoadMany = jest.fn().mockResolvedValue([{ id: "est-1" }]);
			const mockOf = jest.fn().mockReturnValue({ loadMany: mockLoadMany });
			mockRelation.mockReturnValue({ of: mockOf });

			// Override createQueryBuilder for this specific test to return relation support
			const origQBReturn = mockCreateQueryBuilder.getMockImplementation();
			mockCreateQueryBuilder.mockReturnValue({ relation: mockRelation });

			const result = await UserRepository.findUserEstablishments("u1");
			expect(result).toEqual([{ id: "est-1" }]);

			// Restore for subsequent tests
			mockCreateQueryBuilder.mockReturnValue(mockQB);
		});
	});

	describe("getUserDetails", () => {
		it("should join establishments and preferences", async () => {
			mockQB.getOne.mockResolvedValue({ id: "u1", establishments: [], preferences: {} });
			const result = await UserRepository.getUserDetails("u1");
			expect(mockQB.where).toHaveBeenCalledWith("user.id = :userId", { userId: "u1" });
			expect(result).toHaveProperty("id", "u1");
		});
	});

	describe("getAdminStats", () => {
		it("should execute raw SQL queries", async () => {
			mockQuery.mockResolvedValueOnce([{ total_establishments: 10, total_users: 50 }]).mockResolvedValueOnce([{ id: "est-1", trade_name: "Shop" }]);

			const result = await UserRepository.getAdminStats();
			expect(mockQuery).toHaveBeenCalledTimes(2);
			expect(result).toHaveProperty("mainResult");
			expect(result).toHaveProperty("recentEstablishments");
		});
	});
});
