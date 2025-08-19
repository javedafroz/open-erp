export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare const validatePaginationParams: (params: PaginationParams) => {
    page: number;
    limit: number;
    offset: number;
    sortBy?: string;
    sortOrder: "asc" | "desc";
};
export declare const createPaginationResult: <T>(data: T[], total: number, page: number, limit: number) => PaginationResult<T>;
export declare const getPaginationOffset: (page: number, limit: number) => number;
export declare const calculateTotalPages: (total: number, limit: number) => number;
//# sourceMappingURL=pagination.d.ts.map