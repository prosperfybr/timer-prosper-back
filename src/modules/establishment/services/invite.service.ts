import { log } from "@config/Logger";
import { ClientEstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/client-establishment-response.dto";
import { InviteClientDTO } from "@modules/establishment/models/dto/invite/invite-client.dto";
import { InviteEstablishmentDTO } from "@modules/establishment/models/dto/invite/invite-establishment.dto";
import { RespondInviteDTO } from "@modules/establishment/models/dto/invite/respond-invite.dto";
import { ClientEstablishmentEntity } from "@modules/establishment/models/entity/client-establishment.entity";
import { ClientRequestByEnum } from "@modules/establishment/models/enums/client-request-by.enum";
import { ClientRequestStatusEnum } from "@modules/establishment/models/enums/client-request-status.enum";
import { ClientEstablishmentRepository } from "@modules/establishment/repositories/client-establishment.repository";
import { UserEntity } from "@modules/users/models/entity/user.entity";
import { Track } from "@shared/decorators/logs/track.decorator";
import { Service } from "@shared/decorators/service.decorator";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { EmailService } from "@shared/utils/email-service.util";
import { EstablishmentEntity } from "../models/entity/establishment.entity";



/**
 * SE O USUÁRIO NÃO ESTIVER CADASTRADO
 * Mandar um e-mail para o usuário (CLIENTE) para cadastrar-se (APENAS SE FOR SOLICITADO POR E-MAIL NA APLICAÇÃO)
 * 
 * 		SE O PROPRIETÁRIO QUEM CONVIDOU
 * (Seja por QR Code ou por email)
 * 			-> O CLIENTE SE CADASTRA (caso não esteja cadastrado) E O VINCULO ACONTECE AUTOMATICAMENTE.
 * -> SE O CLIENTE QUEM SOLICITOU (Ele já está cadastrado)
 * 			-> O PROPRIETÁRIO É NOTIFICADO PARA APROVAR OU RECUSAR O CONVITE
 * 
 * OBSERVAÇÃO:
 * NA TELA DE CLIENTES DEVE SER ADICIONADO AÇÕES PARA APROVAÇÃO OU RECUSA DE CLIENTES. ALÉM DE PERMITIR DESVINCULAR CLIENTES JÁ APROVADOS.
 */


@Service()
export class InviteService {
	constructor() {}

	/**
	 * O estabelecimento está convidando um cliente
	 * @param payload 
	 * @returns 
	 */
	@Track()
	public async client(payload: InviteClientDTO): Promise<ClientEstablishmentResponseDTO> {
		log.info("Inviting a new client to establishment");

		const { clientEmail, establishmentId } = payload;
		if (!establishmentId) {
			log.error(`A establishment ID is required, but received [${establishmentId}]`);
			throw new BadRequestException("O ID do estabelecimento é obrigatório");
		}

		if (!clientEmail) {
			log.error(`A client email is required`);
			throw new BadRequestException("O e-mail do cliente é obrigatório");
		}

		const invite = await ClientEstablishmentRepository.findInviteByClientAndEstablishment(clientEmail, establishmentId);

		if (!invite.establishment) {
			log.error(`Establishment not found with ID [${establishmentId}`);
			throw new BadRequestException("Estabelecimento não encontrado");
		}

		if (invite.client) {
			log.warn(`This user has been already invited. Nothing to do now`);
			throw new BadRequestException("O cliente já foi convidado");
		}

		log.info(`Client or invite not registered yet`);
		//- Cria um novo usuário temporário para relação com o invite.
		const inviteCreated: ClientEstablishmentEntity = await ClientEstablishmentRepository.save(ClientEstablishmentRepository.create({
			userId: null,
			establishmentId: establishmentId,
			clientEmail,
			status: ClientRequestStatusEnum.PENDING,
			requestedBy: ClientRequestByEnum.ESTABLISHMENT,
			requestedAt: new Date()
		}));

		log.info("Sending email to client requesting a registration in application");
		const subject: string = `O estabelecimento ${invite.establishment.tradeName} está convidando você`;
		const html: string = "";
		const emailService = new EmailService();
		/**
		 * @TODO -> Implementação de e-mail feita, é necessário configurar modo de acesso, e definir informações para o envio de e-mails
		 */
		// emailService.sendEmail(clientEmail, subject, html, null, "invite@timerprosper.com.br");
		
		log.info("Invite created successfully");
		return this.treatResponse(inviteCreated);
	}

	/** CLIENT REQUEST TO ESTABLISHMENT **/
	@Track()
	public async establishment(payload: InviteEstablishmentDTO): Promise<ClientEstablishmentResponseDTO> {
		log.info("Client requesting to establishment");

		const { establishmentIdentifier, clientId } = payload;

		if (!establishmentIdentifier) {
			log.info(`Establishment identifier is required, but is received [${establishmentIdentifier}]`);
			throw new BadRequestException("O identificador (nome, código) do estabelecimento é obrigatório");
		}

		if (!clientId) {
			log.info(`Client ID is required, but is received [${clientId}]`);
			throw new BadRequestException("O ID do cliente é obrigatório");
		}

		const invite = await ClientEstablishmentRepository.findInviteByClientAndEstablishment(clientId, establishmentIdentifier);
		console.log("INVITE: ", invite);

		if (invite.invite && invite.invite.userId === clientId) {
			log.warn(`This user has been already request invite to establishment. Nothing to do now`);
			throw new BadRequestException("O cliente já solicitou um convite para o estabelecimento");
		}

		if (!invite.establishment) {
			log.error(`Establishment not found with identifier [${establishmentIdentifier}`);
			throw new BadRequestException("Estabelecimento não encontrado");
		}

		if (!invite.client) {
			log.error(`Client not found with email`);
			throw new BadRequestException("Cliente não encontrado");
		}

		log.info(`Client or invite not registered yet`);
		const client = invite.client as UserEntity;
		const establishment = invite.establishment as EstablishmentEntity;
		console.log("CLIENT ID: ", client.id);
		console.log("CLIENT EMAIL: ", client.email);
		console.log("ESTABLISHMENT ID: ", establishment.id);
		const inviteToSave = ClientEstablishmentRepository.create({
			userId: invite.client.id,
			establishmentId: invite.establishment.id,
			clientEmail: invite.client.email,
			status: ClientRequestStatusEnum.PENDING,
			requestedBy: ClientRequestByEnum.CLIENT,
			requestedAt: new Date()
		});
		console.log(inviteToSave)
		const inviteCreated: ClientEstablishmentEntity = await ClientEstablishmentRepository.save(inviteToSave);

		log.info("Sending email to establishment owner requesting a new link");
		const subject: string = `O cliente ${invite.client.name} está solicitando vínculo`;
		const html: string = "";
		const text: string = ""
		const emailService = new EmailService();
		/**
		 * @TODO -> Implementação de e-mail feita, é necessário configurar modo de acesso, e definir informações para o envio de e-mails
		 */
		// emailService.sendEmail(invite.owner.email, subject, html, text, "invite@timerprosper.com.br");
		
		log.info("Invite created successfully");
		return this.treatResponse(inviteCreated);
	}

	@Track()
	public async respond(payload: RespondInviteDTO): Promise<ClientEstablishmentResponseDTO> {
		log.info("Responding a client");
		const { inviteId, approve } = payload;

		if (!inviteId) {
			log.error("Invite ID is required");
			throw new BadRequestException("O ID do convite é obrigatório");
		}

		if (approve === null || approve === undefined) {
			log.error("Reject or approve is required");
			throw new BadRequestException("A aprovação ou rejeição do convite é obrigatória");
		}

		const invite: ClientEstablishmentEntity = await ClientEstablishmentRepository.findById(inviteId);
		if (!invite) {
			log.error(`Invite not found by ID [${inviteId}`);
			throw new BadRequestException("Convite não encontrado");
		}

		invite.status = approve === false ? ClientRequestStatusEnum.REJECTED : ClientRequestStatusEnum.APPROVED;
		if (invite.status === ClientRequestStatusEnum.APPROVED) invite.approvedAt = new Date();
		else invite.rejectedAt = new Date();

		invite.updatedAt = new Date();
		await ClientEstablishmentRepository.update(invite.id, invite);
		log.info("Client is responded");
		return this.treatResponse(invite);
	}

	private treatResponse(invite: ClientEstablishmentEntity): ClientEstablishmentResponseDTO {
		return {
			id: invite.id,
			userId: invite.userId,
			establishmentId: invite.establishmentId,
			status: invite.status,
			requestedBy: invite.requestedBy,
			requestedAt: invite.requestedAt,
		} as ClientEstablishmentResponseDTO;
	}
}
