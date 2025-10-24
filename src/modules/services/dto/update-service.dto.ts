export interface UpdateServiceDTO {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  duration?: string;
  serviceTypeId?: string;
}