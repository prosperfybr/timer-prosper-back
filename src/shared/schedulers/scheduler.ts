import cron from "node-cron";
import { AbsenceCronService } from "./absence.scheduler";
import { SubscriptionExpirationScheduler } from "./subscription-expiration.scheduler";
import { log } from "@config/Logger";

export const scheduler = () => {
	log.info("[CRON] STARTING APPLICATION CRON JOBS");
	cron.schedule("0 0 * * *", () => {
		AbsenceCronService.checkExpiredAbsences();
	});
	cron.schedule("1 0 0 * * *", () => {
		SubscriptionExpirationScheduler.handleExpirations();
	});
	log.info("[CRON] CRON JOBS STARTED");
};
