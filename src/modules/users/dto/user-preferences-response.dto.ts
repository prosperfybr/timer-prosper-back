import { UserResponseDTO } from "./user-response.dto";

export interface UserPreferencesResponseDTO {
  id: string;
  userId: string;
  user?: UserResponseDTO;
  darkMode: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}