import { log } from "@config/Logger";

export class InvalidArgumentException implements Error {
  public name: string = "InvalidArgumentException";
  public stack?: string;

  constructor(public message: string, public httpStatusCode: number = 400, stack?: string) {
    log.error(InvalidArgumentException.name, "constructor");
  }
}