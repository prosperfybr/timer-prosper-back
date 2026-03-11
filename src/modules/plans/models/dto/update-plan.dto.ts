import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { PlanNameEnum } from "../enum/plan-name.enum";

export class UpdatePlanDTO {
	@IsEnum(PlanNameEnum)
	@IsOptional()
	public name?: PlanNameEnum;

	@IsString()
	@IsOptional()
	public description?: string;

	@IsInt()
	@Min(0)
	@IsOptional()
	public monthlyPrice?: number;

	@Min(0)
	@Max(1)
	@IsOptional()
	public annualDiscount?: number;

	@IsInt()
	@IsOptional()
	public maxClients?: number | null;

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

	@IsBoolean()
	@IsOptional()
	public active?: boolean;
}
