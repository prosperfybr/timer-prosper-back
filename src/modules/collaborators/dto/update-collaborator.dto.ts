export interface UpdateCollaboratorDTO {
  id: string;
  name?: string;
  surname?: string;
  collaboratorFunction?: string;
  specialty?: string;
  servicesIds?: string[];
  hiringDate?: Date;
  whatsApp?: string;
  email?: string;
  active?: boolean;
  password?: string;
}