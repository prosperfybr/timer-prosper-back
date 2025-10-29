export interface CreateServiceDTO {
  name: string;
  description?: string;
  price: number;
  duration: number;
  serviceTypeId: string;
  establishmentId: string;
}