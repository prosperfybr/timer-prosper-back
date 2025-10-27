export interface IRouteDefinition {
	path: string;
	method: 'get' | 'post' | 'put' | 'delete' | 'patch';
	methodName: string;
	config?: { authenticated?: boolean; activated?: boolean; roles?: string[] }
	swagger: { config: any;};
}