import "reflect-metadata";
import { FindSchedulingService } from "../find-scheduling.service";
import { EstablishmentRepository } from "../../../establishment/repositories/establishment.repository";
import { AppointmentRepository } from "../../repositories/appointment.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../../establishment/repositories/establishment.repository");
jest.mock("../../../establishment/repositories/establishment-hour.repository");
jest.mock("../../../collaborators/repositories/collaborator.repository");
jest.mock("../../../services/repositories/services.repository");
jest.mock("../../../users/repositories/users.repository");
jest.mock("../../repositories/absence-block.repository");
jest.mock("../../repositories/appointment.repository");

describe("FindSchedulingService", () => {
	let service: FindSchedulingService;

	beforeEach(() => {
		service = new FindSchedulingService();
		jest.clearAllMocks();
	});

	describe("findAvailableSlots", () => {
		it("should throw if establishmentId or serviceId missing", async () => {
			await expect(service.findAvailableSlots("", "2025-01-01", "svc-1")).rejects.toThrow(InvalidArgumentException);
			await expect(service.findAvailableSlots("est-1", "2025-01-01", "")).rejects.toThrow(InvalidArgumentException);
		});

		it("should throw if establishment not found", async () => {
			(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue(null);
			await expect(service.findAvailableSlots("est-1", "2025-01-01", "svc-1")).rejects.toThrow(BadRequestException);
		});

		it("should throw if establishment has no services", async () => {
			(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({ id: "est-1", services: [] });
			await expect(service.findAvailableSlots("est-1", "2025-01-01", "svc-1")).rejects.toThrow("O estabelecimento não atende a este serviço");
		});

		it("should throw if service not offered by establishment", async () => {
			(EstablishmentRepository.findByIdOrCode as jest.Mock).mockResolvedValue({
				id: "est-1",
				services: [{ id: "svc-other", name: "Other", duration: 30 }],
			});
			await expect(service.findAvailableSlots("est-1", "2025-01-01", "svc-1")).rejects.toThrow("O estabelecimento não atende a este serviço");
		});
	});

	describe("findAllClientScheduling", () => {
		it("should return empty array if no appointments", async () => {
			(AppointmentRepository.findAppointmentsById as jest.Mock).mockResolvedValue([]);
			const result = await service.findAllClientScheduling("client-1");
			expect(result).toEqual([]);
		});

		it("should return mapped appointments", async () => {
			const mockDate = new Date("2025-01-15T10:00:00Z");
			const appointments = [
				{
					id: "appt-1",
					startTime: mockDate,
					endTime: new Date("2025-01-15T11:00:00Z"),
					status: "CONFIRMED",
					notes: "Test",
					createdAt: mockDate,
					updatedAt: mockDate,
					collaborator: {
						id: "col-1",
						userId: "u1",
						establishment: { id: "est-1", tradeName: "Test Est" },
						user: { name: "John" },
					},
					service: { id: "svc-1", name: "Haircut", price: 5000, duration: 60 },
					client: { id: "c-1", name: "Client", whatsApp: "119999" },
				},
			];
			(AppointmentRepository.findAppointmentsById as jest.Mock).mockResolvedValue(appointments);

			const result = await service.findAllClientScheduling("client-1");
			expect(result).toHaveLength(1);
			expect(result[0].collaboratorName).toBe("John");
			expect(result[0].serviceName).toBe("Haircut");
			expect(result[0].status).toBe("CONFIRMED");
		});
	});
});
