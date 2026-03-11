import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { DiscountTypeEnum } from "../enum/discount-type.enum";

export class UpdatePromotionDTO {
	@IsString()
	@IsOptional()
	public title?: string;

	@IsString()
	@IsOptional()
	public description?: string;

	@IsEnum(DiscountTypeEnum)
	@IsOptional()
	public discountType?: DiscountTypeEnum;

	@IsInt()
	@Min(1)
	@IsOptional()
	public discountValue?: number;

	@IsDateString()
	@IsOptional()
	public startsAt?: string;

	@IsDateString()
	@IsOptional()
	public endsAt?: string;

	@IsArray()
	@IsUUID("all", { each: true })
	@IsOptional()
	public serviceIds?: string[];

	@IsBoolean()
	@IsOptional()
	public active?: boolean;
}
