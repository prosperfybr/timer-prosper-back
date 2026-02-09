import { AppDataSource } from "@config/ormconfig";
import { EstablishmentEntity } from "@modules/establishment/models/entity/establishment.entity";
import { UserEntity } from "../models/entity/user.entity";

export const UserRepository = AppDataSource.getRepository(UserEntity).extend({
	async findById(id: string): Promise<UserEntity> {
		return await this.findOne({ where: { id }, relations: ["establishments"] });
	},
	async findByEmail(email: string): Promise<UserEntity> {
		return await this.findOne({ where: { email }, relations: ['preferences'] });
	},
	async findUserNameByUserId(userId: string): Promise<Pick<UserEntity, "name">> {
		const user = await this.createQueryBuilder("user").select(["user.name"]).where("user.id = :userId", { userId }).getOne();
		return user as Pick<UserEntity, "name">;
	},
	async findUserEstablishments(id: string): Promise<EstablishmentEntity[]> {
		const userWithEstablishments: UserEntity = await this.findOne({
			where: { id },
			relations: ["establishments"],
			order: { establishments: { tradeName: "ASC" } },
		});

		if (!userWithEstablishments) return [];
		return userWithEstablishments.establishments;
	},
	async getUserDetails(userId: string): Promise<any> {
		const result = await this.createQueryBuilder("user")
			.where("user.id = :userId", { userId })
			.leftJoinAndSelect("user.establishments", "establishments")
			.leftJoinAndSelect("user.preferences", "preferences")
			.getOne();

		return result;
	},
	async getAdminStats(): Promise<any> {
		const sql: string = `
		WITH CurrentMetrics AS (
				SELECT 
						(SELECT COUNT(*) FROM establishments) as total_establishments,
						(SELECT COUNT(*) FROM establishments 
						WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as new_establishments_month,

						(SELECT COUNT(*) FROM users) as total_users,
						(SELECT COUNT(*) FROM users 
						WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,

						(SELECT COUNT(*) FROM appointments 
						WHERE start_time >= DATE_TRUNC('month', CURRENT_DATE)) as month_appointments,

						(SELECT COUNT(*) FROM establishments 
						WHERE created_at < DATE_TRUNC('month', CURRENT_DATE)) as prev_total_establishments,
						(SELECT COUNT(*) FROM users 
						WHERE created_at < DATE_TRUNC('month', CURRENT_DATE)) as prev_total_users
		)
		SELECT 
				m.*,
				CASE 
						WHEN prev_total_establishments = 0 THEN 100 
						ELSE ROUND(((total_establishments - prev_total_establishments)::numeric / prev_total_establishments) * 100, 2) 
				END as growth_establishments_pct,
				
				CASE 
						WHEN prev_total_users = 0 THEN 100 
						ELSE ROUND(((total_users - prev_total_users)::numeric / prev_total_users) * 100, 2) 
				END as growth_users_pct
		FROM CurrentMetrics m;`;

		const result = await this.query(sql);

		const recentEstablishmentSql: string = `
			SELECT 
					establishment.id,
					establishment.trade_name,
					owner.name as	owner_name,
					establishment.city,
					establishment.created_at
			FROM establishments as establishment
				INNER JOIN users owner ON establishment.user_id = owner.id
			ORDER BY created_at DESC
			LIMIT 5;`;
		const recentEstablishmentResult = await this.query(recentEstablishmentSql);
		return { mainResult: result, recentEstablishments: recentEstablishmentResult };
	}
});
