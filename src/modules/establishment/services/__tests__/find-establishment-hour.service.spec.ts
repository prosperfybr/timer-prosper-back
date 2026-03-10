import "reflect-metadata";
import { FindEstablishmentHourService } from "../find-establishment-hour.service";
import { EstablishmentHourRepository } from "../../repositories/establishment-hour.repository";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

jest.mock("../../repositories/establishment-hour.repository");

describe("FindEstablishmentHourService", () => {
	let service: FindEstablishmentHourService;
	let formatterUtils: jest.Mocked<FormatterUtils>;

	beforeEach(() => {
		formatterUtils = { formatTime: jest.fn((v) => v) } as any;
		service = new FindEstablishmentHourService(formatterUtils);
		jest.clearAllMocks();
	});

	it("should throw if establishmentId is missing", async () => {
		await expect(service.execute("")).rejects.toThrow(InvalidArgumentException);
	});

	it("should return null if no hours found", async () => {
		(EstablishmentHourRepository.findAllByEstablishment as jest.Mock).mockResolvedValue([]);
		const result = await service.execute("est-1");
		expect(result).toBeNull();
	});

	it("should return formatted hours", async () => {
		const hours = [
			{
				id: "h1",
				dayOfWeek: "MONDAY",
				openingTime: "08:00",
				closingTime: "18:00",
				establishment: { id: "est-1", userId: "u1", tradeName: "Test" },
			},
		];
		(EstablishmentHourRepository.findAllByEstablishment as jest.Mock).mockResolvedValue(hours);

		const result = await service.execute("est-1");
		expect(result.establishmentId).toBe("est-1");
		expect(result.hours).toHaveLength(1);
		expect(result.hours[0].dayOfWeek).toBe("MONDAY");
	});
});
