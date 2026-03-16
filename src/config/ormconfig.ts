import { DataSource, DataSourceOptions } from "typeorm";

const { DATABASE_URL, NODE_ENV } = process.env;

const isProduction = NODE_ENV === "production";
const rootDir = isProduction ? "dist/src" : "src";

const migrationsPath: string = `${rootDir}/shared/infra/database/migrations`;
const entitiesPath: string = `${rootDir}/modules`;

export const AppDataSource: DataSource = new DataSource({
	type: "postgres",
	url: DATABASE_URL,
	entities: [`${entitiesPath}/**/models/entity/*.entity.{ts,js}`],
	migrations: [`${migrationsPath}/*{.ts, .js}`],
	migrationsTransactionMode: "each",
	synchronize: false,
	//logging: NODE_ENV === 'dev' ? ['query', 'error'] : ['error'],
	logging: ["error"],
	extra: {
		max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	},
	cli: {
		migrationsDir: migrationsPath,
	},
} as DataSourceOptions);
