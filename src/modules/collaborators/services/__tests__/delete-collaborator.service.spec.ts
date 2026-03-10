import "reflect-metadata";
import { DeleteCollaboratorService } from "../delete-collaborator.service";
import { CollaboratorRepository } from "../../repositories/collaborator.repository";
import { DeleteUserService } from "../../../users/services/delete-user.service";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

jest.mock("../../repositories/collaborator.repository");

describe("DeleteCollaboratorService", () => {
	let service: DeleteCollaboratorService;
	let deleteUserService: jest.Mocked<DeleteUserService>;

	beforeEach(() => {
		deleteUserService = { execute: jest.fn() } as any;
		service = new DeleteCollaboratorService(deleteUserService);
		jest.clearAllMocks();
	});

	it("should throw if id is missing", async () => {
		await expect(service.execute("")).rejects.toThrow(InvalidArgumentException);
	});

	it("should throw if collaborator not found", async () => {
		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue(null);
		await expect(service.execute("col-1")).rejects.toThrow(BadRequestException);
	});

	it("should delete collaborator and user successfully", async () => {
		(CollaboratorRepository.findOne as jest.Mock).mockResolvedValue({ id: "col-1", userId: "user-1" });
		(CollaboratorRepository.delete as jest.Mock).mockResolvedValue({});
		deleteUserService.execute.mockResolvedValue(undefined);

		await service.execute("col-1");
		expect(deleteUserService.execute).toHaveBeenCalledWith("user-1");
		expect(CollaboratorRepository.delete).toHaveBeenCalledWith("col-1");
	});
});
