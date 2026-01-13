import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { UserResponseDTO } from "../models/dto/user-response.dto";
import { UserEntity } from "../models/entity/user.entity";
import { UserRepository } from "../repositories/users.repository";
import { AdminStatsDTO } from "../models/dto/admin-stats.dto";
import { randomUUID } from "crypto";
import moment from "moment";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class FindUserService {
	constructor(private readonly formatterUtils: FormatterUtils,
	) {}

	@Track()
	public async getUser(id: string): Promise<UserResponseDTO> {
		if (!id) {
			log.error(`User ID is required, but is received: [${id}]`);
			throw new InvalidArgumentException("O ID do usuário é obrigatório");
		}

		const user = await UserRepository.getUserDetails(id);

		if (!user) {
			log.error(`User not found with ID: [${id}]`);
			throw new BadRequestException("Usuário não encontrado com o ID informado");
		}

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			birthDate: user.birthDate,
			whatsApp: user.whatsApp,
			cpf: user.cpf ? this.formatterUtils.addCPFMask(user.cpf) : null,
			profileComplete: user.profileComplete,
			profilePreferences: user.profilePreferences,
			settingsPreferences: user.preferences ? {
				id: user.preferences.id,
				userId: user.id,
				darkMode: user.preferences.darkMode,
				emailNotifications: user.preferences.emailNotifications,
				whatsappNotifications: user.preferences.whatsappNotifications,
			} : 
			{
				id: null,
				userId: user.id,
				darkMode: null,
				emailNotifications: null,
				whatsappNotifications: null,
			},
			establsihmentId: user.establishments && user.establishments.length > 0 ? user.establishments[0].id : null,
			establishments: user.establishments && user.establishments.length > 0 ? user.establishments : [],
		} as UserResponseDTO;
	}

	@Track()
	public async getAllUsers(): Promise<UserResponseDTO[]> {
		const users: UserEntity[] = await UserRepository.find();
		return users.map(user => ({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			profileComplete: user.profileComplete,
			establishments: user.establishments,
		}));
	}

	@Track()
	public async getAdminStats(id: string): Promise<AdminStatsDTO> {
		const { mainResult, recentEstablishments } = await UserRepository.getAdminStats();

		const mainInfo = mainResult[0];

		const stats: AdminStatsDTO = {
			systemStats: {
				totalEstablishments: Number(mainInfo.total_establishments),
				totalUsers: Number(mainInfo.total_users),
				totalAppointments: Number(mainInfo.month_appointments),
				monthlyRevenue: 0,
				newEstablishmentsThisMonth: Number(mainInfo.new_establishments_month),
				newUsersThisWeek: Number(mainInfo.new_users_week),
				activeSubscriptions: 0,
				churnRate: 0,
			},
			establishmentsByPlan: {
				basic: 0,
				professional: 0,
				enterprise: 0
			},
			recentEstablishments: recentEstablishments.map(est => ({
				id: est.id,
				tradeName: est.trade_name,
				ownerName: est.owner_name,
				planId: randomUUID(),
				status: 'active',
				createdAt: est.created_at,
				city: est.city,
			})),
			growthData: mainResult.map(main => ({
				month: moment().format("MMM"),
				establishments: main.growth_establishments_pct,
				users: main.growth_users_pct,
				revenue: 0
			}))
		};

		return stats;
	}
}
