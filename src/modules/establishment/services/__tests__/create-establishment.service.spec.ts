import "reflect-metadata";
import { CreateEstablishmentService } from "../create-establishment.service";
import { UserRepository } from "../../../users/repositories/users.repository";
import { SegmentRepository } from "../../../segment/repositories/segment.repository";
import { EstablishmentRepository } from "../../repositories/establishment.repository";
import { RolesEnum } from "../../../users/models/enum/roles.enum";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { GeneratorUtils } from "@shared/utils/generator.utils";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

// Mocks
jest.mock("../../../users/repositories/users.repository");
jest.mock("../../../segment/repositories/segment.repository");
jest.mock("../../repositories/establishment.repository");

describe("CreateEstablishmentService", () => {
	let createEstablishmentService: CreateEstablishmentService;
	let validatorUtils: jest.Mocked<ValidatorUtils>;
	let generatorUtils: jest.Mocked<GeneratorUtils>;

	beforeEach(() => {
		validatorUtils = {
			validateZipCode: jest.fn(),
			validateTelephone: jest.fn(),
		} as any;

		generatorUtils = {
			generateUniqueCode: jest.fn(() => "unique-code"),
		} as any;

		createEstablishmentService = new CreateEstablishmentService(validatorUtils, generatorUtils);
		jest.clearAllMocks();
	});

	const validPayload = {
		userId: "user-123",
		tradeName: "Test Establishment",
		logo: "logo.png",
		logoDark: "logo-dark.png",
		zipCode: "12345-678",
		street: "Street",
		number: "123",
		complement: "Apt 1",
		neighborhood: "Neighborhood",
		city: "City",
		state: "ST",
		mainPhone: "(11) 99999-9999",
		website: "www.test.com",
		instagram: "@test",
		linkedin: "linkedin/test",
		tiktok: "@test",
		youtube: "youtube/test",
		segmentId: "segment-123",
	};

	it("should create establishment successfully", async () => {
		const user = { id: "user-123", role: RolesEnum.CLIENT, email: "test@example.com" };
		const segment = { id: "segment-123", name: "Barber" };
		const establishmentSaved = { ...validPayload, id: "est-123", code: "unique-code", createdAt: new Date() };

		(UserRepository.findById as jest.Mock).mockResolvedValue(user);
		(SegmentRepository.findById as jest.Mock).mockResolvedValue(segment);
		(EstablishmentRepository.save as jest.Mock).mockResolvedValue(establishmentSaved);
		(UserRepository.update as jest.Mock).mockResolvedValue({});

		validatorUtils.validateZipCode.mockReturnValue(true);
		validatorUtils.validateTelephone.mockReturnValue(true);

		const result = await createEstablishmentService.execute(validPayload);

		expect(result.id).toBe("est-123");
		expect(result.code).toBe("unique-code");
		expect(UserRepository.update).toHaveBeenCalledWith(user.id, { role: RolesEnum.OWNER });
	});

	it("should throw InvalidArgumentException if userId is missing", async () => {
		await expect(createEstablishmentService.execute({ ...validPayload, userId: "" })).rejects.toThrow(InvalidArgumentException);
		await expect(createEstablishmentService.execute({ ...validPayload, userId: "" })).rejects.toThrow(
			"O ID do proprietário do estabelecimento é obrigatório",
		);
	});

	it("should throw BadRequestException if user not found", async () => {
		(UserRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(createEstablishmentService.execute(validPayload)).rejects.toThrow(BadRequestException);
		await expect(createEstablishmentService.execute(validPayload)).rejects.toThrow("Proprietário não encontrado para o estabelecimento");
	});

	it("should throw BadRequestException if segment not found", async () => {
		(UserRepository.findById as jest.Mock).mockResolvedValue({ id: "user-123" });
		(SegmentRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(createEstablishmentService.execute(validPayload)).rejects.toThrow(BadRequestException);
		await expect(createEstablishmentService.execute(validPayload)).rejects.toThrow("Segmento nao encontrado para o estabelecimento");
	});

	it("should throw InvalidArgumentException if validation fails (e.g., zipCode)", async () => {
		const user = { id: "user-123" };
		const segment = { id: "segment-123" };

		(UserRepository.findById as jest.Mock).mockResolvedValue(user);
		(SegmentRepository.findById as jest.Mock).mockResolvedValue(segment);
		validatorUtils.validateZipCode.mockReturnValue(false);

		await expect(createEstablishmentService.execute(validPayload)).rejects.toThrow(InvalidArgumentException);
		await expect(createEstablishmentService.execute(validPayload)).rejects.toThrow("O CEP é inválido");
	});
});
