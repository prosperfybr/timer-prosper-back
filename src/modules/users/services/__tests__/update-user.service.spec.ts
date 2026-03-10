import "reflect-metadata";
import { UpdateUserService } from "../update-user.service";
import { UserRepository } from "../../repositories/users.repository";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

// Mocks
jest.mock("../../repositories/users.repository");
jest.mock("bcryptjs", () => ({
	hash: jest.fn().mockResolvedValue("hashed_password"),
}));

describe("UpdateUserService", () => {
	let updateUserService: UpdateUserService;
	let validatorUtils: jest.Mocked<ValidatorUtils>;

	beforeEach(() => {
		validatorUtils = {
			filterUpdatedFields: jest.fn(),
		} as any;

		updateUserService = new UpdateUserService(validatorUtils);
		jest.clearAllMocks();
	});

	it("should throw BadRequestException if user not found", async () => {
		(UserRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(updateUserService.execute("invalid-id", {} as any)).rejects.toThrow(BadRequestException);
		await expect(updateUserService.execute("invalid-id", {} as any)).rejects.toThrow("Usuário não encontrado");
	});

	it("should update user successfully", async () => {
		const userId = "user-123";
		const userEntity = {
			id: userId,
			email: "test@example.com",
			name: "Old Name",
			profileComplete: false,
		};

		const updateData = {
			userId: userId,
			name: "New Name",
			preferences: {},
		};

		const filteredFields = { name: "New Name" };

		(UserRepository.findById as jest.Mock).mockResolvedValue(userEntity);
		validatorUtils.filterUpdatedFields.mockReturnValue(filteredFields);
		(UserRepository.update as jest.Mock).mockResolvedValue({});

		await updateUserService.execute(userId, updateData as any);

		expect(UserRepository.update).toHaveBeenCalledWith(userId, filteredFields);
	});

	it("should throw BadRequestException if nothing to update", async () => {
		const userId = "user-123";
		const userEntity = { id: userId, email: "test@example.com" };
		const updateData = { userId: userId, preferences: {} };

		(UserRepository.findById as jest.Mock).mockResolvedValue(userEntity);
		validatorUtils.filterUpdatedFields.mockReturnValue({});

		await expect(updateUserService.execute(userId, updateData as any)).rejects.toThrow(BadRequestException);
		await expect(updateUserService.execute(userId, updateData as any)).rejects.toThrow("Não há nenhuma informação do usuário para atualizar");
	});
});
