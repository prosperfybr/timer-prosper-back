import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";
import { InvalidArgumentException } from "@shared/exceptions/InvalidArgumentException";
import { FormatterUtils } from "@shared/utils/formatter.utils";
import { EstablishmentHourResponseDTO, HourResponseDTO } from "@modules/establishment/models/dto/establishment/establishment-hour-response.dto";
import { EstablishmentHourEntity } from "@modules/establishment/models/entity/establishment-hour.entity";
import { EstablishmentHourRepository } from "@modules/establishment/repositories/establishment-hour.repository";
import { Track } from "@shared/decorators/logs/track.decorator";

@Service()
export class FindEstablishmentHourService {
	constructor(
		//- Utils
		private readonly formatterUtils: FormatterUtils,
	) {}

	@Track()
	public async execute(establishmentId: string): Promise<EstablishmentHourResponseDTO> {
		if (!establishmentId) {
			log.error(`Establishment ID is required, but received [${establishmentId}]`);
			throw new InvalidArgumentException("O ID do estabelecimento é obrigatório");
		}

		const establishmentHours: EstablishmentHourEntity[] = await EstablishmentHourRepository.findAllByEstablishment(establishmentId);

		if (!establishmentHours || establishmentHours.length === 0) {
			log.warn(`The establishment does not yet have set operating hours`);
			return null;
		}

		return this.treatData(establishmentHours);
	}

	private treatData(hours: EstablishmentHourEntity[]): EstablishmentHourResponseDTO {
		const [{ establishment }] = hours;

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
			establishment: {
				id: establishment.id,
				userId: establishment.userId,
				segmentId: establishment.segmentId,
				code: establishment.code,
				tradeName: establishment.tradeName,
				logo: establishment.logo,
				logoDark: establishment.logoDark,
				zipCode: establishment.zipCode,
				street: establishment.street,
				number: establishment.number,
				complement: establishment.complement,
				neighborhood: establishment.neighborhood,
				city: establishment.city,
				state: establishment.state,
				mainPhone: establishment.mainPhone,
				website: establishment.website,
				instagram: establishment.instagram,
				linkedin: establishment.linkedin,
				tiktok: establishment.tiktok,
				youtube: establishment.youtube,
				createdAt: establishment.createdAt,
				updatedAt: establishment.updatedAt,
				user: null,
				services: null,
				segment: null,
			},
			hours: hoursToResponse,
		} as EstablishmentHourResponseDTO;
	}
}
