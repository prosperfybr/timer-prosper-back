import "reflect-metadata";
import { IRouteDefinition } from './iroute-definition';

export function PatchMapping(path: string, config?: { authenticated?: boolean, activated?: boolean, roles?: string[] }): Function {
	return (target: any, propertyKey: string) => {
		if (!Reflect.hasMetadata('routes', target.constructor)) Reflect.defineMetadata('routes', [], target.constructor);
		const routes = Reflect.getMetadata('routes', target.constructor) as IRouteDefinition[];
		routes.push({ method: 'patch', path, methodName: propertyKey, config });
		Reflect.defineMetadata('routes', routes, target.constructor);
	}
}