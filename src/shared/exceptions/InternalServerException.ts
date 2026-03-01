import { log } from "@config/Logger";

export class InternalServerException extends Error {
	public readonly name = "InternalServerException";
	public readonly httpStatusCode: number;

	constructor(message: string, httpStatusCode: number = 500) {
		super(message);
		this.httpStatusCode = httpStatusCode;
		Object.setPrototypeOf(this, InternalServerException.prototype);
		log.error(InternalServerException.name, "constructor");
	}
}
