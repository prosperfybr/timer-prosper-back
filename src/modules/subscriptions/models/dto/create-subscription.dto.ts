import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from "class-validator";
import { BillingPeriodEnum } from "../enum/billing-period.enum";

export class CreateSubscriptionDTO {
	@IsUUID()
	@IsNotEmpty()
	public establishmentId: string;

	@IsUUID()
	@IsNotEmpty()
	public planId: string;

	@IsEnum(BillingPeriodEnum)
	@IsNotEmpty()
	public billingPeriod: BillingPeriodEnum;

	@IsObject()
	@IsNotEmpty()
	public paymentMethod: {
		type: "credit_card" | "debit_card" | "pix";
		token?: string;
	};

	@IsOptional()
	@IsObject()
	public customer?: {
		name?: string;
		email?: string;
		document?: string;
	};
}
