import "reflect-metadata";
import { DeleteUserService } from "../delete-user.service";
import { UserRepository } from "../../repositories/users.repository";
import { UserPreferencesRepository } from "../../repositories/user-preferences.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

// Mocks
jest.mock("../../repositories/users.repository");
jest.mock("../../repositories/user-preferences.repository");

describe("DeleteUserService", () => {
	let deleteUserService: DeleteUserService;

	beforeEach(() => {
		deleteUserService = new DeleteUserService();
		jest.clearAllMocks();
	});

	it("should delete user and preferences successfully", async () => {
		const userId = "user-123";
		const preferences = { id: "pref-123", userId: userId };

		(UserPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(preferences);
		(UserPreferencesRepository.delete as jest.Mock).mockResolvedValue({});
		(UserRepository.delete as jest.Mock).mockResolvedValue({});

		await deleteUserService.execute(userId);

		expect(UserPreferencesRepository.findByUserId).toHaveBeenCalledWith(userId);
		expect(UserPreferencesRepository.delete).toHaveBeenCalledWith(preferences.id);
		expect(UserRepository.delete).toHaveBeenCalledWith(userId);
	});

	it("should throw InvalidArgumentException if ID is missing", async () => {
		await expect(deleteUserService.execute("")).rejects.toThrow(InvalidArgumentException);
		await expect(deleteUserService.execute("")).rejects.toThrow("O ID do usuário é obrigatório");
	});
});
