export interface CreateEstablishmentDTO {
  userId: string;
  tradeName: string;
  logo?: string;
  logoDark?: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  mainPhone: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
}