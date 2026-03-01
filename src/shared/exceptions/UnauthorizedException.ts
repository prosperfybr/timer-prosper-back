import { log } from "@config/Logger";

export class UnauthorizedException extends Error {
	public readonly name = "UnauthorizedException";
	public readonly httpStatusCode: number;

	constructor(message: string, httpStatusCode: number = 401) {
		super(message);
		this.httpStatusCode = httpStatusCode;
		Object.setPrototypeOf(this, UnauthorizedException.prototype);
		log.error(UnauthorizedException.name, "constructor");
	}
}
