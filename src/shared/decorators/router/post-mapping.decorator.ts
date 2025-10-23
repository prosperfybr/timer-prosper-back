import "reflect-metadata";
import { IRouteDefinition } from './iroute-definition';

export function PostMapping(path: string, config?: { authenticated?: boolean, activated?: boolean, roles?: string[] }): Function {
	return (target: any, propertyKey: string) => {
		if (!Reflect.hasMetadata('routes', target.constructor)) Reflect.defineMetadata('routes', [], target.constructor);
		const routes = Reflect.getMetadata('routes', target.constructor) as Array<IRouteDefinition>;
		routes.push({ method: 'post', path, methodName: propertyKey, config });
		Reflect.defineMetadata('routes', routes, target.constructor);
	}
}