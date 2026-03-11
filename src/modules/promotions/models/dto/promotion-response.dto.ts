import { DiscountTypeEnum } from "../enum/discount-type.enum";
import { ServicesEntity } from "@modules/services/models/entity/services.entity";

export interface PromotionResponseDTO {
	id: string;
	establishmentId: string;
	title: string;
	description: string;
	discountType: DiscountTypeEnum;
	discountValue: number;
	startsAt: Date;
	endsAt: Date;
	active: boolean;
	services: Pick<ServicesEntity, "id" | "name" | "price" | "duration">[];
}
