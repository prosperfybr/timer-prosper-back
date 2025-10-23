import { log } from "@config/Logger";

export class BadRequestException implements Error {
  public name: string = "BadRequestException";
  public stack?: string;

  constructor(public message: string, public httpStatusCode: number = 400, stack?: string) {
    log.error(BadRequestException.name, "constructor");
  }
}