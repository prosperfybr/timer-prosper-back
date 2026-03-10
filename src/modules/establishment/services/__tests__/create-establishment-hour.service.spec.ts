import "reflect-metadata";
import { CreateEstablishmentHourService } from "../create-establishment-hour.service";
import { EstablishmentRepository } from "../../repositories/establishment.repository";
import { EstablishmentHourRepository } from "../../repositories/establishment-hour.repository";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/establishment.repository");
jest.mock("../../repositories/establishment-hour.repository");

describe("CreateEstablishmentHourService", () => {
	let service: CreateEstablishmentHourService;
	let validatorUtils: jest.Mocked<ValidatorUtils>;
	let formatterUtils: jest.Mocked<FormatterUtils>;

	beforeEach(() => {
		validatorUtils = { validateHours: jest.fn() } as any;
		formatterUtils = { formatTime: jest.fn((v) => v) } as any;
		service = new CreateEstablishmentHourService(validatorUtils, formatterUtils);
		jest.clearAllMocks();
	});

	it("should throw if establishmentId is missing", async () => {
		await expect(service.execute({ establishmentId: "", hours: [] } as any)).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if hours are empty", async () => {
		await expect(service.execute({ establishmentId: "est-1", hours: [] } as any)).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if establishment not found", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue(null);
		await expect(
			service.execute({ establishmentId: "est-1", hours: [{ dayOfWeek: "MONDAY", openingTime: "08:00", closingTime: "18:00" }] } as any),
		).rejects.toThrow(BadRequestException);
	});

	it("should save valid hours successfully", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		validatorUtils.validateHours.mockReturnValue(true);
		(EstablishmentHourRepository.save as jest.Mock).mockResolvedValue({});

		await service.execute({
			establishmentId: "est-1",
			hours: [{ dayOfWeek: "MONDAY", openingTime: "08:00", closingTime: "18:00" }],
		} as any);

		expect(EstablishmentHourRepository.save).toHaveBeenCalled();
	});

	it("should throw if all hours are invalid", async () => {
		(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1" });
		validatorUtils.validateHours.mockReturnValue(false);

		await expect(
			service.execute({
				establishmentId: "est-1",
				hours: [{ dayOfWeek: "MONDAY", openingTime: "invalid", closingTime: "invalid" }],
			} as any),
		).rejects.toThrow(BadRequestException);
	});
});
