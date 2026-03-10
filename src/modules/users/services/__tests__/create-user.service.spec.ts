import "reflect-metadata";
import { CreateUserService } from "../create-user.service";
import { UserRepository } from "../../repositories/users.repository";
import { UserPreferencesRepository } from "../../repositories/user-preferences.repository";
import { ClientEstablishmentRepository } from "../../../establishment/repositories/client-establishment.repository";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { RolesEnum } from "../../models/enum/roles.enum";
import { ClientRequestByEnum } from "@modules/establishment/models/enums/client-request-by.enum";
import { ClientRequestStatusEnum } from "@modules/establishment/models/enums/client-request-status.enum";

// Mocks
jest.mock("../../repositories/users.repository");
jest.mock("../../repositories/user-preferences.repository");
jest.mock("../../../establishment/repositories/client-establishment.repository");
jest.mock("bcryptjs", () => ({
	hash: jest.fn().mockResolvedValue("hashed_password"),
}));

describe("CreateUserService", () => {
	let createUserService: CreateUserService;
	let validatorUtils: jest.Mocked<ValidatorUtils>;
	let formatterUtils: jest.Mocked<FormatterUtils>;

	beforeEach(() => {
		validatorUtils = {
			validateEmail: jest.fn(),
			validateCPF: jest.fn(),
		} as any;

		formatterUtils = {
			removeCPFMask: jest.fn((cpf) => cpf?.replace(/\D/g, "")),
		} as any;

		createUserService = new CreateUserService(validatorUtils, formatterUtils);
		jest.clearAllMocks();
	});

	it("should create a user successfully", async () => {
		const userData = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
			cpf: "12345678901",
			role: RolesEnum.CLIENT,
		};

		validatorUtils.validateEmail.mockReturnValue(true);
		validatorUtils.validateCPF.mockReturnValue(true);

		const savedUser = {
			id: "uuid-123",
			name: userData.name,
			email: userData.email,
			role: RolesEnum.CLIENT,
		};

		(UserRepository.save as jest.Mock).mockResolvedValue(savedUser);
		(UserPreferencesRepository.save as jest.Mock).mockResolvedValue({});
		(ClientEstablishmentRepository.findOne as jest.Mock).mockResolvedValue(null);

		const result = await createUserService.execute(userData);

		expect(result).toEqual(savedUser);
		expect(UserRepository.save).toHaveBeenCalled();
		expect(UserPreferencesRepository.save).toHaveBeenCalled();
	});

	it("should throw if name is too short", async () => {
		const userData = {
			name: "Jo",
			email: "test@example.com",
			password: "password123",
		};

		validatorUtils.validateEmail.mockReturnValue(true);

		await expect(createUserService.execute(userData as any)).rejects.toBeInstanceOf(BadRequestException);
		await expect(createUserService.execute(userData as any)).rejects.toThrow("O nome do usuário é inválido.");
	});

	it("should throw if email is invalid", async () => {
		const userData = {
			name: "Test User",
			email: "invalid-email",
			password: "password123",
		};

		validatorUtils.validateEmail.mockReturnValue(false);

		await expect(createUserService.execute(userData as any)).rejects.toBeInstanceOf(BadRequestException);
		await expect(createUserService.execute(userData as any)).rejects.toThrow("O e-mail informado é inválido.");
	});

	it("should throw if password is missing", async () => {
		const userData = {
			name: "Test User",
			email: "test@example.com",
			password: "",
		};

		validatorUtils.validateEmail.mockReturnValue(true);

		await expect(createUserService.execute(userData as any)).rejects.toBeInstanceOf(BadRequestException);
		await expect(createUserService.execute(userData as any)).rejects.toThrow("A senha é inválida.");
	});

	it("should throw if CPF is invalid", async () => {
		const userData = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
			cpf: "123",
		};

		validatorUtils.validateEmail.mockReturnValue(true);
		validatorUtils.validateCPF.mockReturnValue(false);

		await expect(createUserService.execute(userData as any)).rejects.toBeInstanceOf(BadRequestException);
		await expect(createUserService.execute(userData as any)).rejects.toThrow("O CPF informado pelo usuário é inválido");
	});

	it("should throw BadRequestException if user already exists", async () => {
		const userData = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		};

		validatorUtils.validateEmail.mockReturnValue(true);
		(UserRepository.save as jest.Mock).mockRejectedValue(new Error("Duplicate key"));

		await expect(createUserService.execute(userData as any)).rejects.toBeInstanceOf(BadRequestException);
		await expect(createUserService.execute(userData as any)).rejects.toThrow("Usuário já cadastrado");
	});

	it("should accept invite if exists", async () => {
		const userData = {
			name: "Test User",
			email: "invite@example.com",
			password: "password123",
		};

		validatorUtils.validateEmail.mockReturnValue(true);
		const savedUser = { id: "uuid-123", ...userData, role: RolesEnum.CLIENT };
		(UserRepository.save as jest.Mock).mockResolvedValue(savedUser);

		const invite = {
			requestedBy: ClientRequestByEnum.ESTABLISHMENT,
			clientEmail: userData.email,
		};
		(ClientEstablishmentRepository.findOne as jest.Mock).mockResolvedValue(invite);

		await createUserService.execute(userData as any);

		expect(invite).toMatchObject({
			status: ClientRequestStatusEnum.APPROVED,
			userId: savedUser.id,
		});
		expect(ClientEstablishmentRepository.save).toHaveBeenCalledWith(invite);
	});
});
