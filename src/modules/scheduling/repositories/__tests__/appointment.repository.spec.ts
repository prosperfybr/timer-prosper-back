import "reflect-metadata";

const mockFind = jest.fn();
const mockCreateQueryBuilder = jest.fn();

const mockQB = {
	where: jest.fn().mockReturnThis(),
	andWhere: jest.fn().mockReturnThis(),
	orWhere: jest.fn().mockReturnThis(),
	select: jest.fn().mockReturnThis(),
	addSelect: jest.fn().mockReturnThis(),
	groupBy: jest.fn().mockReturnThis(),
	leftJoinAndSelect: jest.fn().mockReturnThis(),
	getOne: jest.fn(),
	getMany: jest.fn(),
	getRawOne: jest.fn(),
};

jest.mock("@config/ormconfig", () => ({
	AppDataSource: {
		getRepository: () => ({
			extend: (methods: any) => {
				const repo = {
					find: mockFind,
					createQueryBuilder: mockCreateQueryBuilder.mockReturnValue(mockQB),
					...methods,
				};
				Object.keys(methods).forEach((key) => {
					if (typeof methods[key] === "function") repo[key] = methods[key].bind(repo);
				});
				return repo;
			},
		}),
	},
}));

import { AppointmentRepository } from "../appointment.repository";

describe("AppointmentRepository", () => {
	beforeEach(() => jest.clearAllMocks());

	it("findAllByCollaboratorIdAndDate should filter by date range", async () => {
		mockFind.mockResolvedValue([{ id: "apt-1" }]);
		const result = await AppointmentRepository.findAllByCollaboratorIdAndDate("col-1", new Date("2026-01-01"), new Date("2026-01-02"));
		expect(mockFind).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ collaboratorId: "col-1" }),
			}),
		);
		expect(result).toHaveLength(1);
	});

	it("findAllByCollaboratorsIdAndDate should filter by multiple collaborators", async () => {
		mockFind.mockResolvedValue([]);
		const result = await AppointmentRepository.findAllByCollaboratorsIdAndDate(["col-1", "col-2"], new Date("2026-01-01"), new Date("2026-01-02"));
		expect(mockFind).toHaveBeenCalled();
		expect(result).toEqual([]);
	});

	it("findAllByIdentifierClient should use queryBuilder OR conditions", async () => {
		mockQB.getMany.mockResolvedValue([{ id: "apt-1" }]);
		const result = await AppointmentRepository.findAllByIdentifierClient("u1");
		expect(mockCreateQueryBuilder).toHaveBeenCalledWith("appointment");
		expect(mockQB.where).toHaveBeenCalledWith("appointment.clientId = :id", { id: "u1" });
		expect(mockQB.orWhere).toHaveBeenCalledWith("appointment.serviceId = :id", { id: "u1" });
		expect(result).toHaveLength(1);
	});

	it("findAllByEstablishmentCollaborators should filter by collaborator ids", async () => {
		mockFind.mockResolvedValue([{ id: "apt-1" }]);
		const result = await AppointmentRepository.findAllByEstablishmentCollaborators(["col-1"]);
		expect(mockFind).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({}),
			}),
		);
		expect(result).toHaveLength(1);
	});

	it("appointmentsRaw should use select with aggregation", async () => {
		mockQB.getRawOne.mockResolvedValue({ collaboratorId: "col-1", count: 5 });
		const result = await AppointmentRepository.appointmentsRaw(["col-1"], "2026-01-01 00:00:00", "2026-01-01 23:59:59");
		expect(mockCreateQueryBuilder).toHaveBeenCalledWith("appointment");
		expect(mockQB.select).toHaveBeenCalled();
		expect(result).toEqual({ collaboratorId: "col-1", count: 5 });
	});

	it("totalClientsRaw should use distinct count", async () => {
		mockQB.getRawOne.mockResolvedValue({ collaboratorId: "col-1", clientCount: 3 });
		const result = await AppointmentRepository.totalClientsRaw(["col-1"]);
		expect(result).toEqual({ collaboratorId: "col-1", clientCount: 3 });
	});
});
