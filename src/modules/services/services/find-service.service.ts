import { Service } from "@shared/decorators/service.decorator";
import { ServicesRepository } from "../services.repository";
import { ServiceResponseDTO } from "../dto/service-response.dto";
import { log } from "@config/Logger";
import { BadRequestException } from "@shared/exceptions/BadRequestException";
import { ServicesEntity } from "../services.entity";
import { ConverterUtils } from "@shared/utils/converter.utils";
import { PaginatedResult, ServiceRequestFilter } from "../dto/services-request-filter.dto";

@Service()
export class FindServiceService {
  private DEFAULT_LIMIT: number = 10;

  constructor(
    private readonly servicesRepository: ServicesRepository,
    private readonly converterUtils: ConverterUtils
  ) {}

  public async findServiceById(id: string): Promise<ServiceResponseDTO> {
    log.info(`Finding a service with ID [${id}]`);

    if (!id) {
      log.error("ID is invalid");
      throw new BadRequestException("O ID do serviço é obrigatório");
    }

    const service: ServicesEntity = await this.servicesRepository.findById(id);

    if(!service) {
      log.error("Service not found");
      throw new BadRequestException("Serviço não encontrado");
    }

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: this.converterUtils.convertCentsToFloat(service.price),
      duration: service.duration,
      durationFormated: this.converterUtils.convertMinutesInTime(service.duration)
    } as ServiceResponseDTO;
  }

  public async findService(filter: ServiceRequestFilter): Promise<PaginatedResult<ServicesEntity>> {
    const limit: number = parseInt(filter.limit || `${this.DEFAULT_LIMIT}`, 10);
    const page: number = parseInt(filter.page || '1', 10);
    const currentPage: number = Math.max(1, page);
    const skip: number = (currentPage - 1) * limit;
    const whereClause: any = {};

    if (filter.establishmentId) whereClause.establishmentId = filter.establishmentId;
    if (filter.serviceTypeId) whereClause.serviceTypeId = filter.establishmentId;

    const [services, totalItems] = await this.servicesRepository.findAndCount(whereClause, limit, skip);

    const totalPages: number = Math.ceil(totalItems / limit);
    const result: PaginatedResult<ServicesEntity> = {
      data: services,
      meta: {
        totalItems,
        itemCount: services.length,
        itemsPerPage: limit,
        totalPages,
        currentPage
      }
    };

    return result;
  }
}