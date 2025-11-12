import {Service} from "@shared/decorators/service.decorator";
import {InviteClientDTO} from "@modules/establishment/dto/invite-client.dto";
import {InviteEstablishmentDTO} from "@modules/establishment/dto/invite-establishment.dto";
import {log} from "@config/Logger";
import {ClientEstablishmentResponseDTO} from "@modules/establishment/dto/client-establishment-response.dto";
import {EstablishmentRepository} from "@modules/establishment/establishment.repository";
import {UserRepository} from "@modules/users/users.repository";
import {ClientEstablishmentRepository} from "@modules/establishment/client-establishment.repository";
import {UserEntity} from "@modules/users/user.entity";
import {BadRequestException} from "@shared/exceptions/BadRequestException";
import {EstablishmentEntity} from "@modules/establishment/establishment.entity";
import {ClientEstablishmentEntity} from "@modules/establishment/client-establishment.entity";
import {ClientRequestStatusEnum} from "@modules/establishment/dto/client-request-status.enum";
import {ClientRequestByEnum} from "@modules/establishment/dto/client-request-by.enum";
import {RespondInviteDTO} from "@modules/establishment/dto/respond-invite.dto";

@Service()
export class InviteService {

    constructor(
        private readonly establishmentRepository: EstablishmentRepository,
        private readonly userRepository: UserRepository,
        private readonly clientEstablshmentRepository: ClientEstablishmentRepository
    ) {
    }

    /** ESTABLISHMENT INVITES A CLIENT  **/
    public async client(payload: InviteClientDTO): Promise<ClientEstablishmentResponseDTO> {
        log.info("Inviting a new client to establishment");

        const {clientEmail, establishmentId} = payload;
        if (!establishmentId) {
            log.error(`A establishment ID is required, but received [${establishmentId}]`);
            throw new BadRequestException("O ID do estabelecimento é obrigatório");
        }

        if (!clientEmail) {
            log.error(`A client email is required`);
            throw new BadRequestException("O e-mail do cliente é obrigatório");
        }

        const establishment: EstablishmentEntity = await this.establishmentRepository.findById(establishmentId);
        const client: UserEntity = await this.userRepository.findByEmail(clientEmail);

        if (!establishment) {
            log.error(`Establishment not found with ID [${establishmentId}`);
            throw new BadRequestException("Estabelecimento não encontrado");
        }

        if (!client) {
            log.warn(`User not found with email`);
            //- TODO - Deve enviar e-mail mesmo para clientes que não estão cadastrados na base?
            //- TODO - Como devemos tratar clientes que não estão cadastrados na aplicação? Devemos criar um usuário temporário para este cliente para poder fazer associação?
        } else {
            log.info(`User founded by email`);

            const invite: ClientEstablishmentEntity = await this.clientEstablshmentRepository.findByUserId(client.id);
            if (invite) {
                log.warn(`This user has been already invited. Nothing to do now`);
                throw new BadRequestException("O cliente já foi convidado");
            }

            //- TODO - Send email to client
            return this.createInvite(client.id, establishment.id, ClientRequestByEnum.ESTABLISHMENT);
        }
    }

    /** CLIENT REQUEST TO ESTABLISHMENT **/
    public async establishment(payload: InviteEstablishmentDTO): Promise<ClientEstablishmentResponseDTO> {
        log.info("Client requesting to establishment");

        const {establishmentIdentifier, clientId} = payload;

        if (!establishmentIdentifier) {
            log.info(`Establishment identifier is required, but is received [${establishmentIdentifier}]`);
            throw new BadRequestException("O identificador (nome, código) do estabelecimento é obrigatório");
        }

        if (!clientId) {
            log.info(`Client ID is required, but is received [${clientId}]`);
            throw new BadRequestException("O ID do cliente é obrigatório");
        }

        const client: UserEntity = await this.userRepository.findById(clientId);
        const establishment: EstablishmentEntity = await this.establishmentRepository.findOneByIdentifier(establishmentIdentifier);

        if (!establishment) {
            log.error(`Establishment not found with identifier [${establishmentIdentifier}`);
            throw new BadRequestException("Estabelecimento não encontrado");
        }

        if (!client) {
            log.error(`User not found with email`);
            throw new BadRequestException("Cliente não encontrado");
        }

        const invite: ClientEstablishmentEntity = await this.clientEstablshmentRepository.findByUserId(client.id);
        if (invite) {
            log.warn(`This user has been already request invite to establishment. Nothing to do now`);
            throw new BadRequestException("O cliente já solicitou um convite para o estabelecimento");
        }

        //- TODO - Send email to establishment owner
        return this.createInvite(client.id, establishment.id, ClientRequestByEnum.CLIENT);
    }

    public async respond(payload: RespondInviteDTO): Promise<ClientEstablishmentResponseDTO> {
        log.info("Responding a client");
        const {inviteId, approve} = payload;

        if (!inviteId) {
            log.error("Invite ID is required");
            throw new BadRequestException("O ID do convite é obrigatório");
        }

        if (approve === null || approve !== undefined) {
            log.error("Reject or approve is required");
            throw new BadRequestException("A aprovação ou rejeição do convite é obrigatória");
        }

        const invite: ClientEstablishmentEntity = await this.clientEstablshmentRepository.findById(inviteId);
        if (!invite) {
            log.error(`Invite not found by ID [${inviteId}`);
            throw new BadRequestException("Convite não encontrado");
        }

        invite.status = (approve !== null && approve !== undefined) || approve === false ? ClientRequestStatusEnum.REJECTED : ClientRequestStatusEnum.APPROVED;
        if (invite.status === ClientRequestStatusEnum.APPROVED) invite.approvedAt = new Date();
        else invite.rejectedAt = new Date();

        await this.clientEstablshmentRepository.update(invite.id, invite);
        log.info("Client is responded");
        return this.treatResponse(invite);
    }

    private async createInvite(clientId: string, establishmentId: string, requestedBy: ClientRequestByEnum): Promise<ClientEstablishmentResponseDTO> {
        const newInvite: ClientEstablishmentEntity = new ClientEstablishmentEntity();
        newInvite.userId = clientId;
        newInvite.establishmentId = establishmentId;
        newInvite.status = ClientRequestStatusEnum.PENDING;
        newInvite.requestedBy = requestedBy;
        newInvite.requestedAt = new Date();
        newInvite.approvedAt = null;
        newInvite.rejectedAt = null;

        const inviteSaved: ClientEstablishmentEntity = await this.clientEstablshmentRepository.save(newInvite);

        log.info("User has been invited successfully");

        return this.treatResponse(inviteSaved);
    }

    private treatResponse(invite: ClientEstablishmentEntity): ClientEstablishmentResponseDTO {
        return {
            id: invite.id,
            userId: invite.userId,
            establishmentId: invite.establishmentId,
            status: invite.status,
            requestedBy: invite.requestedBy,
            requestedAt: invite.requestedAt
        } as ClientEstablishmentResponseDTO;
    }
}