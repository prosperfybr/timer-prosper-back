import "reflect-metadata";
import { CreateAbsenceBlockService } from "../create-absence.service";
import { EstablishmentRepository } from "../../../establishment/repositories/establishment.repository";
import { CollaboratorRepository } from "../../../collaborators/repositories/collaborator.repository";
import { ServicesRepository } from "../../../services/repositories/services.repository";
import { AbsenceBlockRepository } from "../../repositories/absence-block.repository";
import { AbsenceBlockResponse } from "../../models/dto/absence-block-response.dto";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { AbsenceBlockTypeEnum } from "../../models/enums/absence-block-type.enum";

jest.mock("../../../establishment/repositories/establishment.repository");
jest.mock("../../../collaborators/repositories/collaborator.repository");
jest.mock("../../../services/repositories/services.repository");
jest.mock("../../repositories/absence-block.repository");

describe("CreateAbsenceBlockService", () => {
	let service: CreateAbsenceBlockService;
	let mapper: jest.Mocked<AbsenceBlockResponse>;
	let formatterUtils: jest.Mocked<FormatterUtils>;

	beforeEach(() => {
		mapper = { toDto: jest.fn((val) => [val]) } as any;
		formatterUtils = { formatTime: jest.fn((v) => v) } as any;
		service = new CreateAbsenceBlockService(mapper, formatterUtils);
		jest.clearAllMocks();
	});

	it("should throw if establishment not found", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue(null);
		await expect(service.execute({ establishmentId: "est-1", type: AbsenceBlockTypeEnum.BY_COLLABORATOR } as any)).rejects.toThrow(
			InvalidArgumentException,
		);
	});

	it("should throw for unsupported absence type", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		await expect(service.execute({ establishmentId: "est-1", type: "UNKNOWN" } as any)).rejects.toThrow(BadRequestException);
	});

	it("should throw if collaboratorId is missing for BY_COLLABORATOR type", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		await expect(
			service.execute({
				establishmentId: "est-1",
				type: AbsenceBlockTypeEnum.BY_COLLABORATOR,
				collaboratorId: "",
			} as any),
		).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if collaborator not found", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue(null);
		await expect(
			service.execute({
				establishmentId: "est-1",
				type: AbsenceBlockTypeEnum.BY_COLLABORATOR,
				collaboratorId: "col-1",
			} as any),
		).rejects.toThrow(BadRequestException);
	});

	it("should throw if absence already exists for collaborator", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue({ id: "col-1" });
		(AbsenceBlockRepository.findExisting as jest.Mock).mockResolvedValue([{ id: "existing" }]);

		await expect(
			service.execute({
				establishmentId: "est-1",
				type: AbsenceBlockTypeEnum.BY_COLLABORATOR,
				collaboratorId: "col-1",
				isRecurrent: false,
				startTime: "08:00",
				endTime: "12:00",
			} as any),
		).rejects.toThrow("Ausência já cadastrada");
	});

	it("should create absence by collaborator successfully", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue({ id: "col-1" });
		(AbsenceBlockRepository.findExisting as jest.Mock).mockResolvedValue([]);
		(AbsenceBlockRepository.save as jest.Mock).mockResolvedValue({ id: "abs-new" });

		const result = await service.execute({
			establishmentId: "est-1",
			type: AbsenceBlockTypeEnum.BY_COLLABORATOR,
			collaboratorId: "col-1",
			isRecurrent: false,
			dayOfWeek: "MONDAY",
			startTime: "08:00",
			endTime: "12:00",
			description: "Absence",
			active: true,
		} as any);

		expect(AbsenceBlockRepository.save).toHaveBeenCalled();
	});

	it("should throw if serviceId is missing for BY_SERVICE type", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		await expect(
			service.execute({
				establishmentId: "est-1",
				type: AbsenceBlockTypeEnum.BY_SERVICE,
				serviceId: "",
			} as any),
		).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if service not found", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		(ServicesRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(
			service.execute({
				establishmentId: "est-1",
				type: AbsenceBlockTypeEnum.BY_SERVICE,
				serviceId: "svc-1",
			} as any),
		).rejects.toThrow(BadRequestException);
	});
});
