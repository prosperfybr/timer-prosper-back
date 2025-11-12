export interface CreateCollaboratorDTO {
  name: string;
  surname: string;
  collaboratorFunction: string;
  specialty: string;
  servicesIds: string[];
  establishmentId: string;
  hiringDate?: Date;
  whatsApp: string;
  email: string;
}