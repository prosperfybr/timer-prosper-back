export interface UpdateServiceDTO {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  serviceTypeId?: string;
}