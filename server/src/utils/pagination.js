export const getPagination = ({ page = 1, limit = 20 }) => ({ page, limit, skip: (page - 1) * limit, take: limit });
export const paginated = (data, total, { page, limit }) => ({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 } });
