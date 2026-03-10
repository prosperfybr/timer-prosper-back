import "reflect-metadata";
import { FindUserService } from "../find-user.service";
import { UserRepository } from "../../repositories/users.repository";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { RolesEnum } from "../../models/enum/roles.enum";

// Mocks
jest.mock("../../repositories/users.repository");
jest.mock("crypto", () => ({
	randomUUID: jest.fn(() => "uuid-123"),
}));

describe("FindUserService", () => {
	let findUserService: FindUserService;
	let formatterUtils: jest.Mocked<FormatterUtils>;

	beforeEach(() => {
		formatterUtils = {
			addCPFMask: jest.fn((cpf) => cpf),
		} as any;

		findUserService = new FindUserService(formatterUtils);
		jest.clearAllMocks();
	});

	describe("getUser", () => {
		it("should return user details if found", async () => {
			const userId = "user-123";
			const userEntity = {
				id: userId,
				name: "Test User",
				email: "test@example.com",
				role: RolesEnum.CLIENT,
				cpf: "12345678901",
				profileComplete: true,
				preferences: {
					id: "pref-123",
					darkMode: true,
					emailNotifications: true,
					whatsappNotifications: false,
				},
				establishments: [],
			};

			(UserRepository.getUserDetails as jest.Mock).mockResolvedValue(userEntity);

			const result = await findUserService.getUser(userId);

			expect(result).toMatchObject({
				id: userId,
				name: "Test User",
				settingsPreferences: {
					darkMode: true,
				},
			});
			expect(UserRepository.getUserDetails).toHaveBeenCalledWith(userId);
		});

		it("should throw InvalidArgumentException if ID is missing", async () => {
			await expect(findUserService.getUser("")).rejects.toThrow(InvalidArgumentException);
			await expect(findUserService.getUser(null as any)).rejects.toThrow("O ID do usuário é obrigatório");
		});

		it("should throw BadRequestException if user not found", async () => {
			(UserRepository.getUserDetails as jest.Mock).mockResolvedValue(null);
			await expect(findUserService.getUser("user-123")).rejects.toThrow(BadRequestException);
			await expect(findUserService.getUser("user-123")).rejects.toThrow("Usuário não encontrado com o ID informado");
		});
	});

	describe("getAllUsers", () => {
		it("should return list of users", async () => {
			const usersList = [
				{ id: "1", name: "User 1" },
				{ id: "2", name: "User 2" },
			];
			(UserRepository.find as jest.Mock).mockResolvedValue(usersList);

			const result = await findUserService.getAllUsers();
			expect(result).toHaveLength(2);
			expect(result[0].name).toBe("User 1");
		});
	});

	describe("getAdminStats", () => {
		it("should return admin stats", async () => {
			const mockStats = {
				mainResult: [
					{
						total_establishments: "10",
						total_users: "50",
						month_appointments: "100",
						new_establishments_month: "2",
						new_users_week: "5",
						growth_establishments_pct: 10,
						growth_users_pct: 5,
					},
				],
				recentEstablishments: [{ id: "est-1", trade_name: "Est 1", owner_name: "Owner 1", created_at: new Date(), city: "City" }],
			};

			(UserRepository.getAdminStats as jest.Mock).mockResolvedValue(mockStats);

			const result = await findUserService.getAdminStats("admin-id");

			expect(result.systemStats.totalEstablishments).toBe(10);
			expect(result.recentEstablishments).toHaveLength(1);
			expect(result.recentEstablishments[0].tradeName).toBe("Est 1");
		});
	});
});
