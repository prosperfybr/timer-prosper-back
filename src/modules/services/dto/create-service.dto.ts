export interface CreateServiceDTO {
  name: string;
  description?: string;
  price: number;
  duration: string;
  serviceTypeId: string;
  establishmentId: string;
}