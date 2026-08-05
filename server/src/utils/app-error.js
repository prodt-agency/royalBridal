export class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }
}
export class ValidationError extends AppError { constructor(message = 'Validation failed.', errors = []) { super(message, 422, errors); } }
export class ConflictError extends AppError { constructor(message = 'Conflict.') { super(message, 409); } }
export class UnauthorizedError extends AppError { constructor(message = 'Authentication required.') { super(message, 401); } }
export class ForbiddenError extends AppError { constructor(message = 'You do not have permission to perform this action.') { super(message, 403); } }
export class NotFoundError extends AppError { constructor(message = 'Resource not found.') { super(message, 404); } }
export class InternalServerError extends AppError { constructor(message = 'An unexpected error occurred.') { super(message, 500); } }
