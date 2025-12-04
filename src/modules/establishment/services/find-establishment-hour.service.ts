import { log } from '@config/Logger';
import { Service } from '@shared/decorators/service.decorator';
import { InvalidArgumentException } from '@shared/exceptions/InvalidArgumentException';
import { FormatterUtils } from '@shared/utils/formatter.utils';
import {
	EstablishmentHourResponseDTO,
	HourResponseDTO,
} from '../models/dto/establishment/establishment-hour-response.dto';
import { EstablishmentResponseDTO } from '../models/dto/establishment/establishment-response.dto';
import { EstablishmentHourEntity } from '../models/entity/establishment-hour.entity';
import { EstablishmentHourRepository } from '../repositories/establishment-hour.repository';
import { FindEstablishmentService } from './find-establishment.service';

@Service()
export class FindEstablishmentHourService {
	constructor(
		//- Repositories
		private readonly establishmentHourRepository: EstablishmentHourRepository,
		//- Services
		private readonly findEstablishmentService: FindEstablishmentService,
		//- Utils
		private readonly formatterUtils: FormatterUtils,
	) {}

	public async execute(establishmentId: string): Promise<EstablishmentHourResponseDTO> {
		if (!establishmentId) {
			log.error(`Establishment ID is required, but received [${establishmentId}]`);
			throw new InvalidArgumentException('O ID do estabelecimento é obrigatório');
		}

		const establishment: EstablishmentResponseDTO =
			await this.findEstablishmentService.findById(establishmentId);
		const establishmentHours: EstablishmentHourEntity[] =
			await this.establishmentHourRepository.findAllByEstablishment(establishment.id);
		if (!establishmentHours || establishmentHours.length === 0) {
			log.warn(`The establishment does not yet have set operating hours`);
			return null;
		}

		return this.treatData(establishment, establishmentHours);
	}

	private treatData(
		establishment: EstablishmentResponseDTO,
		hours: EstablishmentHourEntity[],
	): EstablishmentHourResponseDTO {
		const hoursToResponse: HourResponseDTO[] = [];
		hours.forEach((hour) => {
			hoursToResponse.push({
				id: hour.id,
				dayOfWeek: hour.dayOfWeek,
				startTime: this.formatterUtils.formatTime(hour.openingTime),
				endTime: this.formatterUtils.formatTime(hour.closingTime),
				createdAt: hour.createdAt,
				updatedAt: hour.updatedAt,
			} as HourResponseDTO);
		});

		return {
			establishmentId: establishment.id,
			establishment,
			hours: hoursToResponse,
		} as EstablishmentHourResponseDTO;
	}
}
