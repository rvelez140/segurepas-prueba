import { Query } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Helper para paginar queries de Mongoose
 */
export async function paginate<T>(
  query: Query<T[], T>,
  countQuery: Query<number, T>,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  // Aplicar ordenamiento
  if (options.sortBy) {
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [options.sortBy]: sortOrder });
  }

  // Ejecutar queries en paralelo
  const [data, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    countQuery.exec(),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Extraer opciones de paginación de query params
 */
export function getPaginationOptions(query: any): PaginationOptions {
  return {
    page: query.page ? parseInt(query.page) : undefined,
    limit: query.limit ? parseInt(query.limit) : undefined,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
  };
}
