import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";
import { PlanNameEnum } from "../enum/plan-name.enum";

export class CreatePlanDTO {
	@IsEnum(PlanNameEnum)
	@IsNotEmpty()
	public name: PlanNameEnum;

	@IsString()
	@IsNotEmpty()
	public description: string;

	@IsInt()
	@Min(0)
	public monthlyPrice: number;

	@Min(0)
	@Max(1)
	public annualDiscount: number;

	@IsInt()
	@IsOptional()
	public maxClients: number | null;

	@IsBoolean()
	@IsOptional()
	public hasAIScheduler?: boolean;

	@IsBoolean()
	@IsOptional()
	public hasFeedbackCollector?: boolean;

	@IsBoolean()
	@IsOptional()
	public hasCustomWebsite?: boolean;

	@IsBoolean()
	@IsOptional()
	public popular?: boolean;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	public features?: string[];
}
