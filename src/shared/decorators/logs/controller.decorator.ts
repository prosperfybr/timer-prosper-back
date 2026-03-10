import { log } from "@config/Logger";

export function ControllerLog() {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		descriptor.value = async function (...args: any[]) {
			try {
				log.info(`[${target.constructor.name}.${propertyKey}] :: REQUEST RECEIVED STARTING PROCESS ::`);
				const result = await originalMethod.apply(this, args);
				return result;
			} finally {
				log.info(`[${target.constructor.name}.${propertyKey}] :: REQUEST FINISHED ::`);
				console.info();
			}
		};

		return descriptor;
	};
}
