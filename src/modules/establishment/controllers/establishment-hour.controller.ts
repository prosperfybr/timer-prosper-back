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
import { ControllerLog } from '@shared/decorators/logs/controller.decorator';

@RequestMapping('establishment-hours')
@RestController()
export class EstablishmentHourController {
	constructor(
		private readonly createEstablishmentHourService: CreateEstablishmentHourService,
		private readonly findEstablishmentHourService: FindEstablishmentHourService,
		private readonly deleteEstablishmentHourService: DeleteEstablishmentHourService,
	) {}

	@PostMapping('', { authenticated: true, roles: [RolesEnum.ADMIN, RolesEnum.OWNER] })
	@ControllerLog()
	public async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload: CreateEstablishmentHourDTO = req.body as CreateEstablishmentHourDTO;
			await this.createEstablishmentHourService.execute(payload);
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
	@ControllerLog()
	public async findAllEstablishments(req: Request, res: Response, next: NextFunction) {
		try {
			const establishmentId: string = req.params.establishmentId;
			const establishmentHours: EstablishmentHourResponseDTO =
				await this.findEstablishmentHourService.execute(establishmentId);
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
	@ControllerLog()
	public async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const id: string = req.params.id;
			await this.deleteEstablishmentHourService.execute(id);
			return res
				.status(HttpStatusCode.Ok)
				.json({ message: 'Horário de funcionamento do estabelecimento deletado com sucesso.' });
		} catch (error) {
			log.error('An error has occurred while delete a establishment hours. ERROR: ', error);
			next(error);
		}
	}
}
