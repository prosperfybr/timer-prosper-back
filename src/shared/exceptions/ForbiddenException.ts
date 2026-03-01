import { log } from "@config/Logger";

export class ForbiddenException extends Error {
	public readonly name = "ForbiddenException";
	public readonly httpStatusCode: number;

	constructor(message: string, httpStatusCode: number = 403) {
		super(message);
		this.httpStatusCode = httpStatusCode;
		Object.setPrototypeOf(this, ForbiddenException.prototype);
		log.error(ForbiddenException.name, "constructor");
	}
}
