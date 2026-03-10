import "reflect-metadata";
import { DeleteEstablishmentHourService } from "../delete-establishment-hour.service";
import { EstablishmentHourRepository } from "../../repositories/establishment-hour.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/establishment-hour.repository");

describe("DeleteEstablishmentHourService", () => {
	let service: DeleteEstablishmentHourService;

	beforeEach(() => {
		service = new DeleteEstablishmentHourService();
		jest.clearAllMocks();
	});

	it("should delete hour successfully", async () => {
		(EstablishmentHourRepository.findById as jest.Mock).mockResolvedValue({ id: "hour-1" });
		(EstablishmentHourRepository.delete as jest.Mock).mockResolvedValue({});
		await service.execute("hour-1");
		expect(EstablishmentHourRepository.delete).toHaveBeenCalledWith("hour-1");
	});

	it("should throw if ID is missing", async () => {
		await expect(service.execute("")).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if hour not found", async () => {
		(EstablishmentHourRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(service.execute("hour-1")).rejects.toThrow(BadRequestException);
	});
});
