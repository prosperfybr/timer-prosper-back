import "reflect-metadata";
import { CreateCollaboratorService } from "../create-collaborator.service";
import { ServicesRepository } from "../../../services/repositories/services.repository";
import { EstablishmentRepository } from "../../../establishment/repositories/establishment.repository";
import { CollaboratorRepository } from "../../repositories/collaborator.repository";
import { CollaboratorServicesRepository } from "../../repositories/collaborator-services.repository";
import { CreateUserService } from "../../../users/services/create-user.service";
import { UpdateUserService } from "../../../users/services/update-user.service";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../../services/repositories/services.repository");
jest.mock("../../../establishment/repositories/establishment.repository");
jest.mock("../../repositories/collaborator.repository");
jest.mock("../../repositories/collaborator-services.repository");

describe("CreateCollaboratorService", () => {
	let service: CreateCollaboratorService;
	let createUserService: jest.Mocked<CreateUserService>;
	let updateUserService: jest.Mocked<UpdateUserService>;
	let validatorUtils: jest.Mocked<ValidatorUtils>;
	let formatterUtils: jest.Mocked<FormatterUtils>;

	beforeEach(() => {
		createUserService = { execute: jest.fn() } as any;
		updateUserService = { execute: jest.fn() } as any;
		validatorUtils = {
			validateEmail: jest.fn().mockReturnValue(true),
			validateTelephone: jest.fn().mockReturnValue(true),
		} as any;
		formatterUtils = {} as any;
		service = new CreateCollaboratorService(createUserService, updateUserService, validatorUtils, formatterUtils);
		jest.clearAllMocks();
		// Re-apply mocks after clearAllMocks
		validatorUtils.validateEmail.mockReturnValue(true);
		validatorUtils.validateTelephone.mockReturnValue(true);
	});

	const validPayload = {
		name: "John",
		surname: "Doe",
		email: "john@test.com",
		whatsApp: "11999999999",
		specialty: "Barber",
		collaboratorFunction: "Cutter",
		servicesIds: ["svc-1"],
		establishmentId: "est-1",
		hiringDate: new Date(),
	};

	it("should throw if name is invalid", async () => {
		await expect(service.execute({ ...validPayload, name: "" } as any)).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if email is invalid", async () => {
		validatorUtils.validateEmail.mockReturnValue(false);
		await expect(service.execute({ ...validPayload } as any)).rejects.toThrow("O e-mail do colaborador é inválido");
	});

	it("should throw if servicesIds is empty", async () => {
		await expect(service.execute({ ...validPayload, servicesIds: [] } as any)).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if services not found", async () => {
		(ServicesRepository.find as jest.Mock).mockResolvedValue([]);
		await expect(service.execute({ ...validPayload } as any)).rejects.toThrow(BadRequestException);
	});

	it("should throw if establishment not found", async () => {
		(ServicesRepository.find as jest.Mock).mockResolvedValue([{ id: "svc-1" }]);
		(EstablishmentRepository.findOneByIdentifier as jest.Mock).mockResolvedValue(null);
		await expect(service.execute({ ...validPayload } as any)).rejects.toThrow("Estabelecimento não encontrado");
	});

	it("should create collaborator successfully", async () => {
		(ServicesRepository.find as jest.Mock).mockResolvedValue([{ id: "svc-1" }]);
		(EstablishmentRepository.findOneByIdentifier as jest.Mock).mockResolvedValue({ id: "est-1" });
		createUserService.execute.mockResolvedValue({ id: "user-1" } as any);
		updateUserService.execute.mockResolvedValue({} as any);
		(CollaboratorRepository.save as jest.Mock).mockResolvedValue({
			id: "col-1",
			userId: "user-1",
			establishmentId: "est-1",
			collaboratorFunction: "Cutter",
			specialty: "Barber",
			active: true,
		});
		(CollaboratorServicesRepository.save as jest.Mock).mockResolvedValue([{ id: "cs-1" }]);

		const result = await service.execute(validPayload as any);
		expect(result.id).toBe("col-1");
		expect(createUserService.execute).toHaveBeenCalled();
	});
});
