import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { ValidatorUtils } from "@shared/utils/validator.utils";
import { CreateEstablishmentHourDTO } from "../models/dto/establishment/create-establishment-hour.dto";
import { EstablishmentHourEntity } from "../models/entity/establishment-hour.entity";
import { EstablishmentEntity } from "../models/entity/establishment.entity";
import { DaysOfWeekEnum } from "../models/enums/days-of-week.enum";
import { EstablishmentHourRepository } from "../repositories/establishment-hour.repository";
import { EstablishmentRepository } from "../repositories/establishment.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class CreateEstablishmentHourService {
	constructor(
		private readonly validatorUtils: ValidatorUtils,
		private readonly formatterUtils: FormatterUtils,
	) {}

	@Track()
	public async execute(createHour: CreateEstablishmentHourDTO): Promise<void> {
		const { establishmentId, hours } = createHour;

		if (!establishmentId) {
			log.error(`Establishment id is required, but received [${establishmentId}]`);
			throw new InvalidArgumentException("O ID do estabelecimento é obrigatório");
		}

		if (!hours || hours.length === 0) {
			log.error(`Establishment hours is required`);
			throw new InvalidArgumentException("Os horários de abertura e fechamento do estabelecimento são obrigatórios");
		}

		const establishment: EstablishmentEntity = await EstablishmentRepository.findByIdOrCode(establishmentId);

		if (!establishment) {
			log.error(`Establishment not found with ID [${establishmentId}]`);
			throw new BadRequestException("Estabelecimento não encontrado com o ID informado");
		}

		const establishmentHours: EstablishmentHourEntity[] = [];
		let hasErrors: boolean = false;
		hours.forEach(({ dayOfWeek, openingTime, closingTime }: { dayOfWeek: DaysOfWeekEnum; openingTime: string; closingTime: string }) => {
			//- validating hours format
			if (this.validatorUtils.validateHours(openingTime) && this.validatorUtils.validateHours(closingTime)) {
				//- Os horários são válidos
				establishmentHours.push({
					establishmentId: establishment.id,
					dayOfWeek,
					openingTime: this.formatterUtils.formatTime(openingTime),
					closingTime: this.formatterUtils.formatTime(closingTime),
				} as EstablishmentHourEntity);
			} else {
				//- O horário não é válido
				log.warn(
					`This hour has an error. [ESTABLISHMENT_ID: ${establishmentId} | DAY_OF_WEEK: ${dayOfWeek} | OPENING_TIME: ${openingTime} | CLOSING_TIME: ${closingTime}]`,
				);
				hasErrors = true;
			}
		});

		//- Save all establishment hours correct
		if (establishmentHours.length > 0) {
			log.info(`Saving all [${establishmentHours.length}] establishment hours`);
			await EstablishmentHourRepository.save(establishmentHours);
			log.info(`Establishment hours saved successfully`);
		} else if (establishmentHours.length === 0 || hasErrors) {
			//- Has error in some hours
			log.error(`Some hours has error`);
			throw new BadRequestException("Ocorreu um erro ao salvar alguns horários do estabelecimento");
		}
	}
}
