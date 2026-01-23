import { log } from "@config/Logger";

export class InternalServerException implements Error {
  public name: string = "InternalServerException";
  public stack?: string;

  constructor(public message: string, public httpStatusCode: number = 403, stack?: string) {
    log.error(InternalServerException.name, "constructor");
  }
}