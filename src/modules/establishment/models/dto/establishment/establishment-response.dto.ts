import { ClientEstablishmentResponseDTO } from "@modules/establishment/models/dto/establishment/client-establishment-response.dto";
import { SegmentResponseDTO } from "@modules/segment/models/dto/segment-response.dto";
import { ServiceResponseDTO } from "@modules/services/models/dto/service-response.dto";
import { UserResponseDTO } from "@modules/users/models/dto/user-response.dto";

export interface EstablishmentResponseDTO {
	id: string;
	userId: string;
	segmentId: string;
	code: string;
	tradeName: string;
	logo: string;
	logoDark: string;
	zipCode: string;
	street: string;
	number: string;
	complement: string;
	neighborhood: string;
	city: string;
	state: string;
	mainPhone: string;
	website: string;
	instagram: string;
	linkedin: string;
	tiktok: string;
	youtube: string;
	createdAt?: Date;
	updatedAt?: Date;
	user?: UserResponseDTO;
	services?: ServiceResponseDTO[];
	segment?: SegmentResponseDTO;
	clients?: ClientEstablishmentResponseDTO[];
}
