import { log } from "@config/Logger";

export function Track() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {

    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const start = performance.now();

      try {
        log.perform(`[${target.constructor.name}.${propertyKey}] :: STARTING ::`)
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        const end = performance.now();
        const duration = (end - start).toFixed(2);
        log.perform(`[${target.constructor.name}.${propertyKey}] :: FINISHED :: [EXECUTION TIME ${duration}ms]`);
      }
    };

    return descriptor;
  };
}