import { Model } from "mongoose";

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  hasMore: boolean;
}

export function getPaginationParams(url: string, defaultLimit = 9) {
  const { searchParams } = new URL(url);
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  if (!pageParam) return null; // Not paginated -> preserves backward compatibility!

  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(limitParam || String(defaultLimit), 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export async function paginateQuery<T>(
  model: Model<T>,
  filter: Record<string, any>,
  options: {
    page: number;
    limit: number;
    skip: number;
    sort?: Record<string, 1 | -1>;
    populate?: any;
  }
): Promise<PaginatedResult<T>> {
  let query = model.find(filter).sort(options.sort || { createdAt: -1 }).skip(options.skip).limit(options.limit);
  if (options.populate) {
    query = query.populate(options.populate);
  }

  const [items, totalItems] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  return {
    items: items as T[],
    page: options.page,
    limit: options.limit,
    totalItems,
    hasMore: options.skip + items.length < totalItems,
  };
}
