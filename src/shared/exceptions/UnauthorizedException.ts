import { log } from "@config/Logger";

export class UnauthorizedException implements Error {
  public name: string = "UnauthorizedException";
  public stack?: string;

  constructor(public message: string, public httpStatusCode: number = 401, stack?: string) {
    log.error(UnauthorizedException.name, "constructor");
  }
}