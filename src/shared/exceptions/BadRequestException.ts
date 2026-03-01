import { log } from "@config/Logger";

export class BadRequestException extends Error {
	public readonly name = "BadRequestException";
	public readonly httpStatusCode: number;

	constructor(message: string, httpStatusCode: number = 400) {
		super(message);
		this.httpStatusCode = httpStatusCode;
		Object.setPrototypeOf(this, BadRequestException.prototype);
		log.error(BadRequestException.name, "constructor");
	}
}
