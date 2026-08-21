/**
 * Pagination utilities for managing large datasets
 */

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Calculate pagination metadata
 */
export const getPaginationMetadata = (
  total: number,
  page: number,
  pageSize: number
): PaginationState & { totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } => {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

/**
 * Calculate slice indices for array pagination
 */
export const getPaginationSlice = (page: number, pageSize: number) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return { startIndex, endIndex };
};

/**
 * Paginate array data
 */
export const paginateArray = <T>(data: T[], page: number, pageSize: number): T[] => {
  const { startIndex, endIndex } = getPaginationSlice(page, pageSize);
  return data.slice(startIndex, endIndex);
};

/**
 * Common pagination sizes
 */
export const PAGINATION_SIZES = {
  SMALL: 10,
  MEDIUM: 20,
  LARGE: 50,
  XLARGE: 100,
} as const;
