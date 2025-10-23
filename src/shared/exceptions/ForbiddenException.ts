import { log } from "@config/Logger";

export class ForbiddenException implements Error {
  public name: string = "ForbiddenException";
  public stack?: string;

  constructor(public message: string, public httpStatusCode: number = 403, stack?: string) {
    log.error(ForbiddenException.name, "constructor");
  }
}