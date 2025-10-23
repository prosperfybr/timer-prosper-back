import { DataSource, DataSourceOptions } from "typeorm";

const { DATABASE_URL, NODE_ENV } = process.env;

const migrationsPath: string = "src/shared/infra/database/migrations";
const entitiesPath: string = "src/modules";

export const AppDataSource: DataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL,
  entities: [`${entitiesPath}/**/*.entity.{ts,js}`],
  migrations: [`${migrationsPath}/*{.ts, .js}`],
  synchronize: false,
  //logging: NODE_ENV === 'dev' ? ['query', 'error'] : ['error'],
  logging: ['error'],
  cli: {
    migrationsDir: migrationsPath
  }
} as DataSourceOptions);
