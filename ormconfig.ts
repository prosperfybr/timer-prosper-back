import { DataSource, DataSourceOptions } from "typeorm";
import * as path from "path";

const { DATABASE_URL, NODE_ENV } = process.env;

const migrationsPath: string = path.join(__dirname, 'src', 'shared', 'infra', 'database', 'migrations', '*{.ts,.js}');
const entitiesPath: string = path.join(__dirname, "src", "modules", "**", "*.entity.{ts,js}")

export const AppDataSource: DataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  synchronize: false,
  logging: NODE_ENV === 'dev' ? ['query', 'error'] : ['error'],
  cli: {
    migrationsDir: 'src/shared/infra/database/migrations'
  }
} as DataSourceOptions);
