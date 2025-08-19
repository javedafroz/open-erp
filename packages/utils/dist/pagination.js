import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@erp/shared';
export const validatePaginationParams = (params) => {
    const page = Math.max(1, params.page || 1);
    let limit = params.limit || DEFAULT_PAGE_SIZE;
    limit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit));
    const offset = (page - 1) * limit;
    const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';
    return {
        page,
        limit,
        offset,
        sortBy: params.sortBy,
        sortOrder,
    };
};
export const createPaginationResult = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
export const getPaginationOffset = (page, limit) => {
    return (page - 1) * limit;
};
export const calculateTotalPages = (total, limit) => {
    return Math.ceil(total / limit);
};
//# sourceMappingURL=pagination.js.map