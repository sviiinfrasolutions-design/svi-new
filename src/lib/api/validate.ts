import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AppError } from './errors';

/**
 * Validates the request body against a Zod schema.
 * Throws AppError with validation details if invalid.
 *
 * @example
 * const body = await validateBody(request, createUserSchema);
 */
export async function validateBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw AppError.badRequest('Invalid JSON body');
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw AppError.validationError(
      result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }))
    );
  }

  return result.data as z.infer<T>;
}

/**
 * Validates query parameters against a Zod schema.
 * Throws AppError with validation details if invalid.
 *
 * @example
 * const query = validateQuery(request, paginationSchema);
 */
export function validateQuery<T extends z.ZodTypeAny>(request: NextRequest, schema: T): z.infer<T> {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const result = schema.safeParse(params);
  if (!result.success) {
    throw AppError.validationError(
      result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }))
    );
  }

  return result.data as z.infer<T>;
}
