import "reflect-metadata";
import { UpdateCollaboratorService } from "../update-collaborator.service";
import { CollaboratorRepository } from "../../repositories/collaborator.repository";
import { CollaboratorServicesRepository } from "../../repositories/collaborator-services.repository";
import { UserRepository } from "../../../users/repositories/users.repository";
import { FindCollaboratorService } from "../find-collaborator.service";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";

jest.mock("../../repositories/collaborator.repository");
jest.mock("../../repositories/collaborator-services.repository");
jest.mock("../../../users/repositories/users.repository");

describe("UpdateCollaboratorService", () => {
	let service: UpdateCollaboratorService;
	let findCollaboratorService: jest.Mocked<FindCollaboratorService>;

	beforeEach(() => {
		findCollaboratorService = { execute: jest.fn() } as any;
		service = new UpdateCollaboratorService(findCollaboratorService);
		jest.clearAllMocks();
	});

	it("should throw if collaborator not found", async () => {
		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue(null);
		await expect(service.execute("col-1", {} as any)).rejects.toThrow("Colaborador não encontrado");
	});

	it("should throw if user not found", async () => {
		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue({ id: "col-1", userId: "u1" });
		(UserRepository.findById as jest.Mock).mockResolvedValue(null);
		await expect(service.execute("col-1", {} as any)).rejects.toThrow("Colaborador não encontrado");
	});

	it("should update collaborator successfully", async () => {
		const collaborator = { id: "col-1", userId: "u1", collaboratorFunction: "Barber", specialty: "Hair", active: true };
		const user = { id: "u1", name: "John", email: "john@test.com", password: "hash", whatsApp: "119999" };

		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue(collaborator);
		(UserRepository.findById as jest.Mock).mockResolvedValue(user);
		(UserRepository.update as jest.Mock).mockResolvedValue({});
		(CollaboratorRepository.update as jest.Mock).mockResolvedValue({});
		findCollaboratorService.execute.mockResolvedValue({ id: "col-1" } as any);

		const result = await service.execute("col-1", { name: "John", surname: "Updated", servicesIds: [] } as any);
		expect(UserRepository.update).toHaveBeenCalled();
		expect(findCollaboratorService.execute).toHaveBeenCalledWith("col-1");
	});

	describe("toggleStatus", () => {
		it("should throw if collaboratorId is missing", async () => {
			await expect(service.toggleStatus("")).rejects.toThrow(InvalidArgumentException);
		});

		it("should throw if collaborator not found", async () => {
			(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue(null);
			await expect(service.toggleStatus("col-1")).rejects.toThrow(BadRequestException);
		});

		it("should toggle status successfully", async () => {
			(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue({ id: "col-1", active: true });
			(CollaboratorRepository.update as jest.Mock).mockResolvedValue({});
			await service.toggleStatus("col-1");
			expect(CollaboratorRepository.update).toHaveBeenCalledWith("col-1", { active: false });
		});
	});
});
