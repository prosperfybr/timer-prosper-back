import "reflect-metadata";
import { DeleteServiceService } from "../delete-service.service";
import { ServicesRepository } from "../../repositories/services.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

jest.mock("../../repositories/services.repository");

describe("DeleteServiceService", () => {
	let service: DeleteServiceService;

	beforeEach(() => {
		service = new DeleteServiceService();
		jest.clearAllMocks();
	});

	it("should throw if id is missing", async () => {
		await expect(service.delete("")).rejects.toThrow(InvalidArgumentException);
	});

	it("should delete single service", async () => {
		(ServicesRepository.findById as jest.Mock).mockResolvedValue({ id: "svc-1" });
		(ServicesRepository.delete as jest.Mock).mockResolvedValue({});
		await service.delete("svc-1");
		expect(ServicesRepository.delete).toHaveBeenCalledWith("svc-1");
	});

	it("should handle multiple IDs separated by pipe", async () => {
		(ServicesRepository.findById as jest.Mock).mockResolvedValueOnce({ id: "svc-1" }).mockResolvedValueOnce({ id: "svc-2" });
		(ServicesRepository.delete as jest.Mock).mockResolvedValue({});

		await service.delete("svc-1|svc-2");
		expect(ServicesRepository.delete).toHaveBeenCalledTimes(2);
	});

	it("should skip deletion if service not found", async () => {
		(ServicesRepository.findById as jest.Mock).mockResolvedValue(null);
		await service.delete("svc-999");
		expect(ServicesRepository.delete).not.toHaveBeenCalled();
	});
});
