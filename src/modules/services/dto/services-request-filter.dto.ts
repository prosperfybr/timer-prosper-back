export interface ServiceRequestFilter {
  establishmentId: string;
  serviceTypeId: string;
  page?: string;
  limit?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  }
}