import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@erp/shared';

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

export const validatePaginationParams = (params: PaginationParams): {
  page: number;
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
} => {
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

export const createPaginationResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
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

export const getPaginationOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

export const calculateTotalPages = (total: number, limit: number): number => {
  return Math.ceil(total / limit);
};
