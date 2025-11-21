import { log } from '@config/Logger';
import { RolesEnum } from '@modules/users/models/enum/roles.enum';
import { RestController } from '@shared/decorators/restcontroller.decorator';
import { DeleteMapping } from '@shared/decorators/router/delete-mapping.decorator';
import { GetMapping } from '@shared/decorators/router/get-mapping.decorator';
import { PostMapping } from '@shared/decorators/router/post-mapping.decorator';
import { RequestMapping } from '@shared/decorators/router/request-mapping.decorator';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { CreateEstablishmentHourDTO } from '../models/dto/establishment/create-establishment-hour.dto';
import { EstablishmentHourResponseDTO } from '../models/dto/establishment/establishment-hour-response.dto';
import { CreateEstablishmentHourService } from '../services/create-establishment-hour.service';
import { DeleteEstablishmentHourService } from '../services/delete-establishment-hour.service';
import { FindEstablishmentHourService } from '../services/find-establishment-hour.service';

@RequestMapping('establishment-hours')
@RestController()
export class EstablishmentHourController {
	constructor(
		private readonly createEstablishmentHourService: CreateEstablishmentHourService,
		private readonly findEstablishmentHourService: FindEstablishmentHourService,
		private readonly deleteEstablishmentHourService: DeleteEstablishmentHourService,
	) {}

	@PostMapping('', { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			log.info('Creating a new hour for establishment');
			const payload: CreateEstablishmentHourDTO = req.body as CreateEstablishmentHourDTO;
			await this.createEstablishmentHourService.execute(payload);
			log.info('Hour for establishent created successfully');
			return res.status(HttpStatusCode.Created).json({
				message: 'Horário de funcionamento do estabelecimento criado com sucesso.',
				payload: null,
			});
		} catch (error) {
			log.error('An error has occurred while create a new establishment hour. ERROR: ', error);
			next(error);
		}
	}

	@GetMapping('/all/:establishmentId', { authenticated: true })
	public async findAllEstablishments(req: Request, res: Response, next: NextFunction) {
		try {
			log.info('Finding all establishments hours');
			const establishmentId: string = req.params.establishmentId;
			const establishmentHours: EstablishmentHourResponseDTO =
				await this.findEstablishmentHourService.execute(establishmentId);
			log.info('All establishments founded successfully');
			return res.status(HttpStatusCode.Ok).json({
				message: 'Horários de funcionamento do estabelecimento listado com sucesso',
				payload: establishmentHours,
			});
		} catch (error) {
			log.error('An error has occurred while find all establishments hours. ERROR: ', error);
			next(error);
		}
	}

	@DeleteMapping('/:id', { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			log.info('Deleting a establishment');
			const id: string = req.params.id;
			await this.deleteEstablishmentHourService.execute(id);
			log.info('Establishment deleted successfully');
			return res
				.status(HttpStatusCode.Ok)
				.json({ message: 'Horário de funcionamento do estabelecimento deletado com sucesso.' });
		} catch (error) {
			log.error('An error has occurred while delete a establishment hours. ERROR: ', error);
			next(error);
		}
	}
}
