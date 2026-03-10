import "reflect-metadata";
import { CancelSchedulingService } from "../cancel-scheduling.service";
import { AppointmentRepository } from "../../repositories/appointment.repository";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { AppointmentStatusEnum } from "../../models/enums/appointment-status.enum";

jest.mock("../../repositories/appointment.repository");

describe("CancelSchedulingService", () => {
	let service: CancelSchedulingService;

	beforeEach(() => {
		service = new CancelSchedulingService();
		jest.clearAllMocks();
	});

	it("should cancel appointment successfully", async () => {
		const appointment = { id: "appt-1", status: AppointmentStatusEnum.CONFIRMED };
		(AppointmentRepository.findOne as jest.Mock).mockResolvedValue(appointment);
		(AppointmentRepository.update as jest.Mock).mockResolvedValue({});

		await service.execute("appt-1");

		expect(AppointmentRepository.update).toHaveBeenCalledWith("appt-1", { status: AppointmentStatusEnum.CANCELLED });
	});

	it("should throw if appointment not found", async () => {
		(AppointmentRepository.findOne as jest.Mock).mockResolvedValue(null);
		await expect(service.execute("appt-1")).rejects.toThrow(BadRequestException);
		await expect(service.execute("appt-1")).rejects.toThrow("Agendamento não encontrado");
	});
});
