import "reflect-metadata";
import { Router } from "express";
import Container from "typedi";

import { IRouteDefinition } from "./iroute-definition";
import { ensureAuthenticated } from "@shared/middlewares/ensure-authenticated.middleware";
import { can } from "@shared/middlewares/can.middleware";

//- Router do express
export const router: Router = Router();

export function RequestMapping(routerPrefix: string): Function {
	return (target: any) => {
		if (!routerPrefix.startsWith("/")) routerPrefix = `/${routerPrefix}`;

		Reflect.defineMetadata("prefix", routerPrefix, target);
		if (!Reflect.hasMetadata("routes", target)) Reflect.defineMetadata("routes", [], target);

		const routes: IRouteDefinition[] = Reflect.getMetadata("routes", target);
		const instance: any = Container.get(target);
		routes.forEach((route: IRouteDefinition) => {
			if (route.config) {
				const midds = [];
				if (route.config.authenticated) midds.push(ensureAuthenticated());
				if (route.config.roles) midds.push(can(route.config.roles));
				router[route.method](`${routerPrefix}${route.path}`, midds, instance[route.methodName].bind(instance));
			} else {
				router[route.method](`${routerPrefix}${route.path}`, instance[route.methodName].bind(instance));
			}
		});
	};
}