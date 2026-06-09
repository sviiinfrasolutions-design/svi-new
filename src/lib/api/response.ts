import { NextResponse } from 'next/server';

/**
 * Standardized API response helpers.
 * All API routes should use these for consistent response shapes.
 */

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Success response for single items.
 */
export function success<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Success response for paginated lists.
 */
export function paginatedSuccess<T>(data: T[], meta: PaginationMeta, status = 200) {
  return NextResponse.json({ data, meta }, { status });
}

/**
 * Success response for list endpoints (non-paginated).
 */
export function listSuccess<T>(data: T[], status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Success response for create operations.
 */
export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

/**
 * Success response for delete operations (no content).
 */
export function deleted() {
  return new NextResponse(null, { status: 204 });
}

/**
 * Calculate pagination metadata.
 */
export function calculatePagination(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
