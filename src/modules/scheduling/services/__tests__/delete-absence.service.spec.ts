import "reflect-metadata";
import { DeleteAbsenceBlockService } from "../delete-abscense.service";
import { AbsenceBlockRepository } from "../../repositories/absence-block.repository";

jest.mock("../../repositories/absence-block.repository");

describe("DeleteAbsenceBlockService", () => {
	let service: DeleteAbsenceBlockService;

	beforeEach(() => {
		service = new DeleteAbsenceBlockService();
		jest.clearAllMocks();
	});

	it("should delete absence successfully", async () => {
		(AbsenceBlockRepository.delete as jest.Mock).mockResolvedValue({});
		await service.execute("abs-1");
		expect(AbsenceBlockRepository.delete).toHaveBeenCalledWith({ id: "abs-1" });
	});
});
