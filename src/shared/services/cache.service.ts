import { Service } from "@shared/decorators/service.decorator";
import NodeCache from "node-cache";
import { log } from "@config/Logger";

export interface CacheOptions {
	ttl?: number; // segundos
	checkperiod?: number;
}

@Service()
export class CacheService {
	private cache: NodeCache;

	constructor() {
		this.cache = new NodeCache({
			stdTTL: 600, // 10 minutos padrão
			checkperiod: 120, // verifica expirados a cada 2 minutos
			useClones: false, // melhor performance
		});

		this.cache.on("expired", (key, value) => {
			log.debug(`Cache expired for key: ${key}`);
		});
	}

	get<T>(key: string): T | undefined {
		const value = this.cache.get<T>(key);
		if (value) {
			log.debug(`Cache hit for key: ${key}`);
		} else {
			log.debug(`Cache miss for key: ${key}`);
		}
		return value;
	}

	set<T>(key: string, value: T, ttl?: number): boolean {
		const success = this.cache.set(key, value, ttl || 600);
		if (success) {
			log.debug(`Cache set for key: ${key}, ttl: ${ttl || 600}s`);
		}
		return success;
	}

	del(key: string | string[]): number {
		const deleted = this.cache.del(key);
		log.debug(`Cache deleted ${deleted} key(s)`);
		return deleted;
	}

	flush(): void {
		this.cache.flushAll();
		log.info("Cache flushed");
	}

	keys(): string[] {
		return this.cache.keys();
	}

	getStats(): NodeCache.Stats {
		return this.cache.getStats();
	}
}
