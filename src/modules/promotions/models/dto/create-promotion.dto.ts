import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { DiscountTypeEnum } from "../enum/discount-type.enum";

export class CreatePromotionDTO {
	@IsUUID()
	@IsNotEmpty()
	public establishmentId: string;

	@IsString()
	@IsNotEmpty()
	public title: string;

	@IsString()
	@IsOptional()
	public description?: string;

	@IsEnum(DiscountTypeEnum)
	@IsNotEmpty()
	public discountType: DiscountTypeEnum;

	@IsInt()
	@Min(1)
	public discountValue: number;

	@IsDateString()
	public startsAt: string;

	@IsDateString()
	public endsAt: string;

	@IsArray()
	@IsUUID("all", { each: true })
	@IsNotEmpty()
	public serviceIds: string[];
}
