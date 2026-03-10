import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "@shared/exceptions/BadRequestException";

export function validationMiddleware<T>(type: any, skipMissingProperties = false) {
	return (req: Request, res: Response, next: NextFunction) => {
		const dtoObj = plainToInstance(type, req.body);
		validate(dtoObj, { skipMissingProperties, whitelist: true, forbidNonWhitelisted: true }).then((errors: ValidationError[]) => {
			if (errors.length > 0) {
				const message = errors.map((error: ValidationError) => Object.values(error.constraints || {})).join(", ");
				next(new BadRequestException(message));
			} else {
				req.body = dtoObj;
				next();
			}
		});
	};
}
