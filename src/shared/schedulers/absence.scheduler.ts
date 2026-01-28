import { log } from "@config/Logger";
import { AbsenceBlockRepository } from "@modules/scheduling/repositories/absence-block.repository";

export const AbsenceCronService = {
	async checkExpiredAbsences() {
		log.info("⏱️ SCHEDULER ⏱️ Starting verification for expired absences");
		try {
			const expiredAbsences = await AbsenceBlockRepository.createQueryBuilder("absence")
				.where("absence.is_active = :isActive", { isActive: true })
				.andWhere("absence.recurrence_rule NOT IN (:...weeklyRules)", { weeklyRules: ["0", "1", "2", "3", "4", "5", "6"] })
				.andWhere(
					`
						(
							regexp_replace(
								absence.recurrence_rule,
								'GMT([+-]\\d{2})(\\d{2})',
								'\\1:\\2'
							)
						)::timestamptz < NOW()
					`,
				)
				.getMany();

			if (expiredAbsences && expiredAbsences.length > 0) {
				log.info(`Expired absences founded SETTING TO INACTIVE all them. ABSENCES EXPIRED [${expiredAbsences.length}]`);
				for (const absence of expiredAbsences) await AbsenceBlockRepository.update(absence.id, { isActive: false });
				log.info(`All Expired [${expiredAbsences.length}] absences founded is now INACTIVE.`);
			} else log.info(`No absences expired founded`);
		} catch (error) {
			log.error(`An error has occurred to process scheduler. ERROR: `, error);
		}

		log.info("⏱️ SCHEDULER ⏱️ Absences verification finished");
	},
};
