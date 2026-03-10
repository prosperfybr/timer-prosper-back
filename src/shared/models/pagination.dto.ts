export interface PaginationParams {
	page?: number;
	limit?: number;
	sort?: string;
	order?: "ASC" | "DESC";
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export class PaginationUtils {
	static DEFAULT_PAGE = 1;
	static DEFAULT_LIMIT = 10;
	static MAX_LIMIT = 100;

	static parsePaginationParams(params: PaginationParams): Required<PaginationParams> {
		return {
			page: Math.max(1, typeof params.page === "string" ? parseInt(params.page) : params.page || this.DEFAULT_PAGE),
			limit: Math.min(typeof params.limit === "string" ? parseInt(params.limit) : params.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT),
			sort: params.sort || "createdAt",
			order: params.order || "DESC",
		};
	}

	static createPaginatedResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
		const totalPages = Math.ceil(total / limit);

		return {
			data,
			total,
			page,
			limit,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		};
	}
}
