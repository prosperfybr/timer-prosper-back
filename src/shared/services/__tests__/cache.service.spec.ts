import { CacheService } from "../cache.service";

describe("CacheService", () => {
	let cacheService: CacheService;

	beforeEach(() => {
		cacheService = new CacheService();
	});

	afterEach(() => {
		cacheService.flush();
	});

	it("should set and get value", () => {
		const key = "test-key";
		const value = { data: "test" };

		cacheService.set(key, value);
		const retrieved = cacheService.get(key);

		expect(retrieved).toEqual(value);
	});

	it("should return undefined for non-existent key", () => {
		const value = cacheService.get("non-existent");
		expect(value).toBeUndefined();
	});

	it("should delete key", () => {
		const key = "test-key";
		cacheService.set(key, "value");

		const deleted = cacheService.del(key);
		expect(deleted).toBe(1);

		const value = cacheService.get(key);
		expect(value).toBeUndefined();
	});

	it("should expire after TTL", async () => {
		const key = "ttl-key";
		cacheService.set(key, "value", 1); // 1 second TTL

		await new Promise((resolve) => setTimeout(resolve, 1500));

		const value = cacheService.get(key);
		expect(value).toBeUndefined();
	});

	it("should flush all keys", () => {
		cacheService.set("key1", "value1");
		cacheService.set("key2", "value2");

		cacheService.flush();

		expect(cacheService.keys().length).toBe(0);
	});
});
