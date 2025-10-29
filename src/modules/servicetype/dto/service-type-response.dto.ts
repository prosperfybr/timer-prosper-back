import { ServiceResponseDTO } from "@modules/services/dto/service-response.dto";

export interface ServiceTypeResponseDTO {
  id: string;
  name: string;
  description: string;
  segmentId: string;
  segmentName: string;
  services: ServiceResponseDTO[];
}