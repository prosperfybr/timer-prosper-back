import { PlanNameEnum } from "../enum/plan-name.enum";

export interface PlanResponseDTO {
	id: string;
	name: PlanNameEnum;
	description: string;
	monthlyPrice: number;
	annualDiscount: number;
	maxClients: number | null;
	hasAIScheduler: boolean;
	hasFeedbackCollector: boolean;
	hasCustomWebsite: boolean;
	popular: boolean;
	features: string[];
	active: boolean;
}
