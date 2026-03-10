import { AppDataSource } from "@config/ormconfig";

beforeAll(async () => {
	// if (!AppDataSource.isInitialized) {
	//   await AppDataSource.initialize();
	// }
});

afterAll(async () => {
	// if (AppDataSource.isInitialized) {
	//   await AppDataSource.destroy();
	// }
});
