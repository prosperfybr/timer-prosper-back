import { log } from "@config/Logger";

export class InvalidArgumentException extends Error {
	public readonly name = "InvalidArgumentException";
	public readonly httpStatusCode: number;

	constructor(message: string, httpStatusCode: number = 400) {
		super(message);
		this.httpStatusCode = httpStatusCode;
		Object.setPrototypeOf(this, InvalidArgumentException.prototype);
		log.error(InvalidArgumentException.name, "constructor");
	}
}
