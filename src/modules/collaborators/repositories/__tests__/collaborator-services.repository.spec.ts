import "reflect-metadata";

const mockFind = jest.fn();
const mockManager = {
	transaction: jest.fn(),
	delete: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
};

jest.mock("@config/ormconfig", () => ({
	AppDataSource: {
		getRepository: () => ({
			extend: (methods: any) => {
				const repo = { find: mockFind, manager: mockManager, ...methods };
				Object.keys(methods).forEach((key) => {
					if (typeof methods[key] === "function") repo[key] = methods[key].bind(repo);
				});
				return repo;
			},
		}),
	},
}));

import { CollaboratorServicesRepository } from "../collaborator-services.repository";

describe("CollaboratorServicesRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findAllServicesByCollaboratorId should filter by collaboratorId", async () => {
		mockFind.mockResolvedValue([{ collaboratorId: "col-1", serviceId: "svc-1" }]);
		const result = await CollaboratorServicesRepository.findAllServicesByCollaboratorId("col-1");
		expect(mockFind).toHaveBeenCalledWith({ where: { collaboratorId: "col-1" } });
		expect(result).toHaveLength(1);
	});

	it("syncRelationship should return early if no changes", async () => {
		await CollaboratorServicesRepository.syncRelationship("col-1", [], []);
		expect(mockManager.transaction).not.toHaveBeenCalled();
	});

	it("syncRelationship should call transaction for additions and removals", async () => {
		mockManager.transaction.mockImplementation(async (cb: any) => {
			await cb(mockManager);
		});

		await CollaboratorServicesRepository.syncRelationship("col-1", ["svc-new"], ["svc-old"]);
		expect(mockManager.transaction).toHaveBeenCalled();
	});
});
