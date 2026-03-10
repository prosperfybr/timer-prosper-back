import "reflect-metadata";
import { FindCollaboratorService } from "../find-collaborator.service";
import { CollaboratorRepository } from "../../repositories/collaborator.repository";
import { EstablishmentRepository } from "../../../establishment/repositories/establishment.repository";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

jest.mock("../../repositories/collaborator.repository");
jest.mock("../../../establishment/repositories/establishment.repository");

describe("FindCollaboratorService", () => {
	let service: FindCollaboratorService;

	beforeEach(() => {
		service = new FindCollaboratorService();
		jest.clearAllMocks();
	});

	describe("execute (find by id)", () => {
		it("should throw if id is empty", async () => {
			await expect(service.execute("")).rejects.toThrow(InvalidArgumentException);
		});

		it("should return null if no collaborator found", async () => {
			(CollaboratorRepository.findCollaboratorInformations as jest.Mock).mockResolvedValue([]);
			const validUUID = "550e8400-e29b-41d4-a716-446655440000";
			const result = await service.execute(validUUID);
			expect(result).toBeNull();
		});

		it("should return collaborator data when found", async () => {
			const mockData = [
				{
					collaborator_id: "col-1",
					collaborator_user_id: "u1",
					collaborator_establishment_id: "est-1",
					collaborator_collaborator_function: "Barber",
					collaborator_specialty: "Hair",
					collaborator_hiring_date: new Date(),
					collaborator_active: true,
					collaborator_created_at: new Date(),
					collaborator_updated_at: new Date(),
					service_id: "svc-1",
					service_name: "Corte",
					service_description: "Desc",
					service_price: 3000,
					service_duration: 30,
					user_id: "u1",
					user_name: "John",
					user_email: "john@test.com",
					user_password: "hash",
					user_role: "colaborador",
					user_birth_date: null,
					user_whatsapp: "119999",
					user_cpf: null,
					user_preferences: null,
					establishment_id: "est-1",
					establishment_user_id: "owner-1",
					establishment_segment_id: "seg-1",
					establishment_code: "CODE",
					establishment_trade_name: "Shop",
					establishment_logo: null,
					establishment_logo_dark: null,
					establishment_zip_code: "00000",
					establishment_street: "Rua",
					establishment_number: "1",
					establishment_complement: null,
					establishment_neighborhood: "Centro",
					establishment_city: "SP",
					establishment_state: "SP",
					establishment_main_phone: "119999",
					establishment_website: null,
					establishment_instagram: null,
					establishment_linkedin: null,
					establishment_tiktok: null,
					establishment_youtube: null,
					establishment_created_at: new Date(),
					establishment_updated_at: new Date(),
				},
			];
			(CollaboratorRepository.findCollaboratorInformations as jest.Mock).mockResolvedValue(mockData);
			const validUUID = "550e8400-e29b-41d4-a716-446655440000";
			const result = await service.execute(validUUID);
			expect(result.id).toBe("col-1");
			expect(result.servicesIds).toContain("svc-1");
		});
	});

	describe("getAllEstablishmentCollaborators", () => {
		it("should throw if establishmentId is invalid", async () => {
			await expect(service.getAllEstablishmentCollaborators("")).rejects.toThrow(InvalidArgumentException);
		});

		it("should return empty if no collaborators", async () => {
			const validUUID = "550e8400-e29b-41d4-a716-446655440000";
			(CollaboratorRepository.findEstablishmentCollaborators as jest.Mock).mockResolvedValue([]);
			const result = await service.getAllEstablishmentCollaborators(validUUID);
			expect(result).toEqual([]);
		});
	});

	describe("getCollaboratorStats", () => {
		it("should throw if collaboratorId is ALL but ownerId is empty", async () => {
			await expect(service.getCollaboratorStats("ALL", "")).rejects.toThrow(InvalidArgumentException);
		});

		it("should return stats for single collaborator", async () => {
			const validUUID = "550e8400-e29b-41d4-a716-446655440000";
			const rawStats = [
				{
					total_appointments: "5",
					total_scheduled_duration: "120",
					total_clients: "3",
					appointment_start_time: "2026-01-01T10:00:00",
					client_name: "Client 1",
					service_name: "Corte",
					appointment_end_time: "2026-01-01T10:30:00",
					establishment_opening_time: "08:00",
					establishment_closing_time: "18:00",
				},
			];
			(CollaboratorRepository.findCollaboratorStats as jest.Mock).mockResolvedValue(rawStats);

			const result = await service.getCollaboratorStats(validUUID);
			expect(result.collaboratorId).toBe(validUUID);
			expect(result.appointmentsToday).toBe(5);
		});
	});
});
