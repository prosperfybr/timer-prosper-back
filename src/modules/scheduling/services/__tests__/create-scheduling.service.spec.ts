import "reflect-metadata";
import { CreateSchedulingService } from "../create-scheduling.service";
import { EstablishmentRepository } from "../../../establishment/repositories/establishment.repository";
import { CollaboratorRepository } from "../../../collaborators/repositories/collaborator.repository";
import { ServicesRepository } from "../../../services/repositories/services.repository";
import { UserRepository } from "../../../users/repositories/users.repository";
import { FindSchedulingService } from "../find-scheduling.service";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../../establishment/repositories/establishment.repository");
jest.mock("../../../establishment/repositories/establishment-hour.repository");
jest.mock("../../../collaborators/repositories/collaborator.repository");
jest.mock("../../../collaborators/repositories/collaborator-services.repository");
jest.mock("../../../services/repositories/services.repository");
jest.mock("../../../users/repositories/users.repository");
jest.mock("../../repositories/appointment.repository");
jest.mock("../../repositories/absence-block.repository");

describe("CreateSchedulingService", () => {
	let service: CreateSchedulingService;
	let findSchedulingService: jest.Mocked<FindSchedulingService>;

	beforeEach(() => {
		findSchedulingService = { findAvailableSlots: jest.fn() } as any;
		service = new CreateSchedulingService(findSchedulingService);
		jest.clearAllMocks();
	});

	it("should throw InvalidArgumentException if establishmentId is missing", async () => {
		await expect(
			service.execute({
				establishmentId: "",
				collaboratorId: "c1",
				serviceId: "s1",
				clientId: "cl1",
				date: "2025-01-01",
				startTime: "10:00",
			} as any),
		).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw InvalidArgumentException if clientId is missing", async () => {
		await expect(
			service.execute({
				establishmentId: "e1",
				collaboratorId: "c1",
				serviceId: "s1",
				clientId: "",
				date: "2025-01-01",
				startTime: "10:00",
			} as any),
		).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw BadRequestException if any entity not found", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue(null);
		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue({ id: "c1" });
		(ServicesRepository.findById as jest.Mock).mockResolvedValue({ id: "s1" });
		(UserRepository.findById as jest.Mock).mockResolvedValue({ id: "cl1" });

		await expect(
			service.execute({
				establishmentId: "e1",
				collaboratorId: "c1",
				serviceId: "s1",
				clientId: "cl1",
				date: "2025-01-01",
				startTime: "10:00",
			} as any),
		).rejects.toThrow(BadRequestException);
	});

	it("should throw if collaborator does not belong to establishment", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "e1", services: [{ id: "s1" }] });
		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue({ id: "c1", establishmentId: "other-est" });
		(ServicesRepository.findById as jest.Mock).mockResolvedValue({ id: "s1" });
		(UserRepository.findById as jest.Mock).mockResolvedValue({ id: "cl1" });

		await expect(
			service.execute({
				establishmentId: "e1",
				collaboratorId: "c1",
				serviceId: "s1",
				clientId: "cl1",
				date: "2025-01-01",
				startTime: "10:00",
			} as any),
		).rejects.toThrow("O colaborador informado não trabalha no estabelecimento informado");
	});
});
